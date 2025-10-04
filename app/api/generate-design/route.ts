// app/api/generate-design/route.ts
import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import OpenAI, { toFile } from "openai";
import { getItem } from "@/lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readPublic(relPath: string) {
  // relPath can start with "/" — normalize it
  const abs = path.join(process.cwd(), "public", relPath.replace(/^\/+/, ""));
  return fs.readFile(abs);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const space = form.get("space");
    const materialIdsRaw = form.get("materialIds")?.toString() ?? "[]"; // JSON or CSV (slugs)
    const imagePathsRaw  = form.get("imagePaths")?.toString() ?? "[]";  // JSON or CSV (/materials/... paths)
    const instructions   = form.get("instructions")?.toString() ?? "";

    if (!(space instanceof File)) {
      return NextResponse.json(
        { error: "space (File) is required" },
        { status: 400 }
      );
    }

    // Parse slugs/paths from either JSON array or CSV
    let materialIds: string[] = [];
    try { materialIds = JSON.parse(materialIdsRaw); }
    catch { materialIds = materialIdsRaw.split(",").map(s => s.trim()).filter(Boolean); }

    let imagePaths: string[] = [];
    try { imagePaths = JSON.parse(imagePathsRaw); }
    catch { imagePaths = imagePathsRaw.split(",").map(s => s.trim()).filter(Boolean); }

    // Prepare base image (user’s space)
    const spaceBuf  = Buffer.from(await space.arrayBuffer());
    const spaceExt  = (space.type?.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const spaceFile = await toFile(spaceBuf, `space.${spaceExt}`, {
      type: space.type || "image/jpeg",
    });

    // Resolve sample images (from catalog slugs and/or direct public paths)
    const sampleFiles: File[] = [];

    // 1) Catalog slugs -> resolve to image path via getItem
    for (const slug of materialIds) {
      const item = getItem(slug);
      if (!item?.image) continue;
      const buf = await readPublic(item.image);
      const ext = path.extname(item.image).slice(1).toLowerCase();
      const mime = `image/${ext === "jpg" ? "jpeg" : ext || "jpeg"}`;
      sampleFiles.push(
        await toFile(buf, path.basename(item.image), { type: mime })
      );
    }

    // 2) Direct image paths, e.g. "/materials/acoustic/acoustic-1.jpg"
    for (const rel of imagePaths) {
      const buf = await readPublic(rel);
      const ext = path.extname(rel).slice(1).toLowerCase();
      const mime = `image/${ext === "jpg" ? "jpeg" : ext || "jpeg"}`;
      sampleFiles.push(
        await toFile(buf, path.basename(rel), { type: mime })
      );
    }

    const client = new OpenAI({ apiKey });

    const prompt = [
      "Apply the referenced material sample(s) to the appropriate surfaces in the space photo.",
      "Preserve camera perspective, lighting, scale, shadows, and existing geometry.",
      "Do not add or remove furniture/objects; only change surface finish/texture.",
      "If multiple references are provided, use them on accents or blend them sensibly.",
      instructions.trim() ? `Extra instructions: ${instructions.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Use Images Edits with the space image as the first image and
    // the sample images as additional references.
    const edit = await client.images.edits({
      model: "gpt-image-1",
      image: [spaceFile, ...sampleFiles],
      prompt,
      size: "1024x1024",
    });

    const b64 = edit.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    const png = Buffer.from(b64, "base64");
    return new NextResponse(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("generate-design error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
