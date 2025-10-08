// app/api/generate-design/route.ts
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

    const spaceBuf = Buffer.from(await space.arrayBuffer());
    const spaceFile = await toFile(spaceBuf, "space.jpg", { type: "image/jpeg" });

    let maskFile: File | undefined;
    if (mask) {
      const maskBuf = Buffer.from(await mask.arrayBuffer());
      maskFile = await toFile(maskBuf, "mask.png", { type: "image/png" });
    }

    const prompt =
      instructions ||
      "Replace the transparent areas of the mask with a photorealistic new material that matches lighting and perspective. Keep other regions unchanged.";

    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: spaceFile,
      ...(maskFile ? { mask: maskFile } : {}),
      prompt,
      size: "1024x1024",
    });

    const b64 = result.data[0].b64_json!;
    const png = Buffer.from(b64, "base64");
    return new NextResponse(png, { headers: { "content-type": "image/png" } });
  } catch (err: any) {
    console.error("generate-design error:", err);
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
