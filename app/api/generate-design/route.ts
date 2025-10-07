import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const form = await req.formData();
    const space = form.get("space") as File | null;
    const mask = form.get("mask") as File | null; // optional
    const instructions = (form.get("instructions") || "").toString();

    if (!space) {
      return NextResponse.json({ error: "space (File) is required" }, { status: 400 });
    }

    const spaceFile = await toFile(
      Buffer.from(await space.arrayBuffer()),
      space.name || "space.jpg",
      { type: space.type || "image/jpeg" }
    );

    let maskFile: File | undefined;
    if (mask) {
      maskFile = await toFile(
        Buffer.from(await mask.arrayBuffer()),
        mask.name || "mask.png",
        { type: mask.type || "image/png" }
      );
    }

    const prompt =
      instructions ||
      "Apply the selected material to the intended areas only. Preserve geometry, lighting and all other surfaces.";

    // Correct SDK call for image editing
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: spaceFile,
      ...(maskFile ? { mask: maskFile } : {}),
      prompt,
      size: "1024x1024",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "OpenAI did not return an image." }, { status: 502 });
    }

    const png = Buffer.from(b64, "base64");
    return new NextResponse(png, { headers: { "content-type": "image/png" } });
  } catch (err: any) {
    console.error("generate-design error:", err);
    const msg =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
