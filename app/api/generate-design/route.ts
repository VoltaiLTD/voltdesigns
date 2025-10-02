import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import OpenAI, { toFile } from "openai";
import { getItem } from "@/lib/catalog"; // still works for catalog slugs

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readPublic(relPath: string) {
  const abs = path.join(process.cwd(), "public", relPath.replace(/^\/+/, ""));
  return fs.readFile(abs);
}

export async function POST(req: Request) {
  try {
    // ... (apiKey + formData + space like before)

    const form = await req.formData();
    const space = form.get("space") as File | null;
    const materialIdsRaw = form.get("materialIds")?.toString() ?? "[]"; // JSON or CSV of slugs
    const imagePathsRaw  = form.get("imagePaths")?.toString() ?? "[]";  // NEW: JSON or CSV of /materials/... paths
    const instructions   = form.get("instructions")?.toString() ?? "";

    if (!space) return NextResponse.json({ error: "space (File) is required" }, { status: 400 });

    // Parse both styles (slugs + direct image paths)
    let materialIds: string[] = [];
    try { materialIds = JSON.parse(materialIdsRaw); }
    catch { materialIds = materialIdsRaw.split(",").map((s) => s.trim()).filter(Boolean); }

    let imagePaths: string[] = [];
    try { imagePaths = JSON.parse(imagePathsRaw); }
    catch { imagePaths = imagePathsRaw.split(",").map((s) => s.trim()).filter(Boolean); }

    // Load uploaded space and chosen sample images
    const spaceBuf = Buffer.from(await space.arrayBuffer());
    const sampleFiles: File[] = [];

    // 1) Catalog slugs → resolve to image
    for (const slug of materialIds) {
      const item = getItem(slug);
      if (!item) continue;
      const buf = await readPublic(item.image);
      sampleFiles.push(
        await toFile(buf, path.basename(item.image), { type: "image/jpeg" })
      );
    }

    // 2) Direct image paths (e.g., "/materials/acp/foo.jpg")
    for (const rel of imagePaths) {
      const buf = await readPublic(rel);
      sampleFiles.push(
        await toFile(buf, path.basename(rel), { type: "image/jpeg" })
      );
    }

    // ... (construct spaceFile, prompt, call OpenAI, return PNG) same as before
  } catch (err: any) {
    // ...
  }
}
