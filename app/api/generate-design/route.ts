// app/api/generate-design/route.ts
import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, data: unknown) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    // 1) Validate content-type
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return json(400, { error: "Expected multipart/form-data" });
    }

    const form = await req.formData().catch(() => null);
    if (!form) return json(400, { error: "Invalid form data" });

    const space = form.get("space") as File | null;
    const mask = form.get("mask") as File | null; // optional
    const instructions = (form.get("instructions") || "").toString().trim();

    if (!space) return json(400, { error: "`space` (File) is required" });

    // 2) Optional mock mode so UI always works while you debug real model access
    if (process.env.MOCK_AI === "1") {
      const buf = Buffer.from(await space.arrayBuffer());
      return new NextResponse(buf, { headers: { "content-type": space.type || "image/jpeg" } });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return json(500, { error: "Missing OPENAI_API_KEY" });

    // 3) Prepare OpenAI payload
    const openai = new OpenAI({ apiKey });

    const spaceBuf = Buffer.from(await space.arrayBuffer());
    const spaceFile = await toFile(spaceBuf, "space.jpg", {
      type: space.type || "image/jpeg",
    });

    let maskFile: File | undefined;
    if (mask) {
      const maskBuf = Buffer.from(await mask.arrayBuffer());
      maskFile = await toFile(maskBuf, "mask.png", { type: "image/png" });
    }

    const prompt =
      instructions ||
      "Apply the selected finish to the appropriate regions while keeping lighting and perspective consistent. Do not add or remove objects.";

    // 4) Call OpenAI Images Edit (gpt-image-1)
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: spaceFile,
      ...(maskFile ? { mask: maskFile } : {}),
      prompt,
      size: "1024x1024",
    });

    const b64 = result?.data?.[0]?.b64_json;
    if (!b64) {
      return json(502, { error: "No image returned from model." });
    }
    const png = Buffer.from(b64, "base64");
    return new NextResponse(png, { headers: { "content-type": "image/png" } });
  } catch (err: any) {
    // 5) Surface real upstream error
    const status = err?.status || err?.response?.status || 500;
    const detail =
      err?.response?.data ||
      err?.error ||
      err?.message ||
      "Unexpected error calling image edit API";
    console.error("generate-design error:", detail);
    return json(status, {
      error: typeof detail === "string" ? detail : JSON.stringify(detail),
    });
  }
}
