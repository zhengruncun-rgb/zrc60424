import { SYSTEM_PROMPT, CONTENT_GENERATION_PROMPT } from "./prompts";

export type ModelMode = "mock" | "auto" | "deepseek" | "kimi" | "openai";

type GenerateResponse = {
  extracted: string;
  scene: string;
  result: {
    lecture_outline: string;
    error_analysis: string;
    remediation: string;
    parent_feedback: string;
    reflection: string;
  };
  quality: {
    passed: boolean;
    score: number;
    issues: string[];
  };
};

function buildMock(userInput: string): GenerateResponse {
  return {
    extracted: userInput,
    scene: "作业讲评",
    result: {
      lecture_outline: "【模拟数据】这里会生成课堂讲评提纲。",
      error_analysis: "【模拟数据】这里会分析共性错因。",
      remediation: "【模拟数据】这里会生成分层补救建议。",
      parent_feedback: "【模拟数据】这里会生成家长反馈话术。",
      reflection: "【模拟数据】这里会生成简短课后反思。",
    },
    quality: {
      passed: true,
      score: 80,
      issues: [],
    },
  };
}

function getProviderConfig(modelMode: ModelMode) {
  const provider =
    modelMode !== "auto" ? modelMode : process.env.AI_PROVIDER || "deepseek";

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";

  const baseUrl =
    process.env.AI_BASE_URL ||
    (provider === "openai"
      ? "https://api.openai.com/v1"
      : provider === "kimi"
      ? "https://api.moonshot.cn/v1"
      : "https://api.deepseek.com");

  const model =
    process.env.AI_MODEL ||
    process.env.OPENAI_MODEL ||
    (provider === "openai"
      ? "gpt-4o-mini"
      : provider === "kimi"
      ? "moonshot-v1-8k"
      : "deepseek-chat");

  return { provider, apiKey, baseUrl, model };
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("模型返回内容不是有效 JSON");
  }
}

export async function generateFeedback(
  userInput: string,
  modelMode: ModelMode = "auto"
): Promise<GenerateResponse> {
  if (modelMode === "mock") {
    return buildMock(userInput);
  }

  const { provider, apiKey, baseUrl, model } = getProviderConfig(modelMode);

  if (!apiKey) {
    return buildMock(userInput);
  }

  try {
    const body: Record<string, unknown> = {
      model,
      temperature: 0.35,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content:
            CONTENT_GENERATION_PROMPT +
            "\n\n老师输入：\n" +
            userInput,
        },
      ],
    };

    if (provider === "openai") {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`模型调用失败：${res.status} ${text}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("模型没有返回内容");
    }

    const result = extractJson(content) as GenerateResponse["result"];

    return {
      extracted: userInput,
      scene: "作业讲评",
      result,
      quality: {
        passed: true,
        score: 85,
        issues: [],
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";

    return {
      extracted: userInput,
      scene: "作业讲评",
      result: {
        lecture_outline: `模型调用失败：${message}`,
        error_analysis: "",
        remediation: "",
        parent_feedback: "",
        reflection: "",
      },
      quality: {
        passed: false,
        score: 0,
        issues: [message],
      },
    };
  }
}