import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;
    const product = formData.get("product") as string;

    if (!description || !image) {
      return NextResponse.json({ error: "Missing inputs" }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Design idea for ${product}. User: ${description}`,
      size: "1024x1024",
    });

    return NextResponse.json({ url: response.data[0].url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
