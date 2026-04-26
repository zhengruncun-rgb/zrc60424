import { NextResponse } from "next/server";
import { generateFeedback } from "@/lib/ai";

type GenerateRequest = {
  userInput?: string;
  modelMode?: "mock" | "auto" | "deepseek" | "kimi" | "openai";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    const userInput = body.userInput?.trim();
    const modelMode = body.modelMode ?? "auto";

    if (!userInput) {
      return NextResponse.json({ error: "请输入老师的课堂描述。" }, { status: 400 });
    }

    const response = await generateFeedback(userInput, modelMode);
    return NextResponse.json(response);
  } catch (error) {
    console.error("/api/generate error", error);
    return NextResponse.json({ error: "生成失败，请稍后重试。" }, { status: 500 });
  }
}
