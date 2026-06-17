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

type FeedbackResult = GenerateResponse["result"];

function buildMock(userInput: string): GenerateResponse {
  return {
    extracted: userInput,
    scene: "作业讲评",
    result: {
      lecture_outline:
        "【模拟数据】先让学生说清题目问什么，再对比错误列式和正确思路，最后用一道同构题检查是否真正会迁移。",
      error_analysis:
        "【模拟数据】学生表面上是算错，背后可能卡在审题路径、数量关系建模和步骤监控。讲评时不要急着报答案，先把学生思路问出来。",
      remediation:
        "【课堂追问】这道题先找哪个信息？为什么这样列式？如果条件换一种说法，还能判断吗？\n【变式检测】换一个同类题，让学生说出单位量和数量关系，再独立列式。",
      parent_feedback:
        "【模拟数据】今天练习中，孩子主要不是不会算，而是审题和数量关系整理还不够稳定。建议先让孩子说清题意，再动笔列式。",
      reflection:
        "【模拟数据】本次讲评提醒我，后续不能只讲标准答案，要先诊断学生卡在哪个能力点，再设计追问和变式检测，帮助学生形成可迁移的方法。",
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

function cleanField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function completeResult(result: Partial<FeedbackResult>, userInput: string): FeedbackResult {
  const errorAnalysis = cleanField(result.error_analysis);
  const lectureOutline = cleanField(result.lecture_outline);
  const remediation = cleanField(result.remediation);
  const parentFeedback = cleanField(result.parent_feedback);
  const reflection = cleanField(result.reflection);

  const diagnosis =
    errorAnalysis ||
    `学生这次的典型错误是：${userInput}。建议先不要急着讲答案，先判断学生是卡在审题、方法理解、步骤监控，还是表达规范。`;

  return {
    error_analysis: diagnosis,
    lecture_outline:
      lectureOutline ||
      "1. 先请学生复述题目要求，说清“题目问什么、已知什么”。\n2. 再对照典型错误，让学生看见自己卡在哪一步。\n3. 最后用一道同类型小题当堂检查，确认学生是否能迁移。",
    remediation:
      remediation ||
      "【课堂追问】\n1. 你第一步先看到了哪个信息？\n2. 这一步为什么这样做？\n3. 如果条件换一种说法，方法还一样吗？\n\n【变式检测】\n给学生一道同类型但数字或表述略有变化的小题，让学生先说思路再动笔，重点看是否能避开刚才的错误。",
    parent_feedback:
      parentFeedback ||
      "今天练习中，孩子主要不是不会做，而是对题意和方法步骤的理解还不够稳定。建议在家练习时，先让孩子说清题目问什么、准备怎么做，再动笔完成。",
    reflection:
      reflection ||
      "这次讲评提醒我，不能只把正确答案讲完，还要先判断学生卡在哪个能力点。后续讲评时，我会先通过追问暴露学生思路，再用变式题检查学生是否真正理解并能迁移。",
  };
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

    const result = completeResult(extractJson(content) as Partial<FeedbackResult>, userInput);

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
