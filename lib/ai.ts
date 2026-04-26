import {
  CONTENT_GENERATION_PROMPT,
  INFO_EXTRACTION_PROMPT,
  QUALITY_CHECK_PROMPT,
  REWRITE_PROMPT,
  SCENE_CLASSIFICATION_PROMPT,
  SYSTEM_PROMPT,
} from "@/lib/prompts";

export type ExtractedInfo = {
  grade: string;
  subject: string;
  lesson_content: string;
  main_errors: string[];
  class_situation: string;
  desired_outputs: string[];
  tone: string;
  missing_info: string[];
};

export type SceneType =
  | "作业讲评"
  | "小测反馈"
  | "单元检测反馈"
  | "作文反馈"
  | "听写反馈"
  | "家长沟通"
  | "教学反思";

export type GeneratedResult = {
  lecture_outline: string;
  error_analysis: string;
  remediation: string;
  parent_feedback: string;
  reflection: string;
};

export type QualityReport = {
  passed: boolean;
  score: number;
  issues: string[];
};

export type GenerateResponse = {
  extracted: ExtractedInfo;
  scene: SceneType | string;
  result: GeneratedResult;
  quality: QualityReport;
};

const provider = process.env.AI_PROVIDER || "openai";
const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const aiModel = process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

const defaultExtracted: ExtractedInfo = {
  grade: "",
  subject: "",
  lesson_content: "",
  main_errors: [],
  class_situation: "",
  desired_outputs: [],
  tone: "",
  missing_info: [],
};

const defaultResult: GeneratedResult = {
  lecture_outline: "",
  error_analysis: "",
  remediation: "",
  parent_feedback: "",
  reflection: "",
};

const defaultQuality: QualityReport = {
  passed: true,
  score: 85,
  issues: [],
};

async function callOpenAIJson<T>(instruction: string, payload: Record<string, unknown>): Promise<T> {
  const requestBody: {
    model: string;
    temperature: number;
    messages: Array<{ role: "system" | "user"; content: string }>;
    response_format?: { type: "json_object" };
  } = {
    model: aiModel,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `${instruction}\n\n请只返回 JSON，不要解释。\n\n输入数据：${JSON.stringify(payload, null, 2)}`,
      },
    ],
  };

  if (provider === "openai") {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI 请求失败: ${response.status} ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI 返回为空");
  }

  return JSON.parse(content) as T;
}

function buildMock(userInput: string): GenerateResponse {
  const extracted: ExtractedInfo = {
    grade: userInput.includes("四年级")
      ? "四年级"
      : userInput.includes("五年级")
        ? "五年级"
        : userInput.includes("三年级")
          ? "三年级"
          : "",
    subject: userInput.includes("数学")
      ? "数学"
      : userInput.includes("语文")
        ? "语文"
        : userInput.includes("英语")
          ? "英语"
          : "",
    lesson_content: "根据输入自动提取的课堂内容（Mock）",
    main_errors: ["知识点定位不准", "步骤遗漏", "表达不完整"],
    class_situation: "多数学生基础有，但细节不稳，优中差分化明显。",
    desired_outputs: ["讲评提纲", "家长反馈", "课后反思"],
    tone: "务实、温和、可执行",
    missing_info: [],
  };

  return {
    extracted,
    scene: userInput.includes("听写") ? "听写反馈" : "作业讲评",
    result: {
      lecture_outline:
        "先用2分钟快速复盘错题类型，再挑两道典型题示范‘对齐数位/圈出关键词/检查进位’。中段让学生同桌互讲步骤，最后用1道变式题当堂检测，确保会做且会说。",
      error_analysis:
        "本次错误集中在‘步骤会背但细节失误’：看似会做，实则在关键点（如进位、题干完整理解）掉链子。说明学生还没形成稳定的检查习惯和题目语言转化能力。",
      remediation:
        "分层安排：基础组先做模板题巩固关键步骤；提高组做1题多问，训练读题与表达；薄弱组用‘错因卡片’逐条纠偏。课堂上每10分钟插入一次口头复述，防止机械做题。",
      parent_feedback:
        "今天我们重点练了本课核心题型，孩子整体能跟上，但在细节检查和完整表达上还需要再稳一稳。建议今晚用10分钟做1道同类题，做完请孩子讲一遍步骤，我们会在明天课堂继续针对性巩固。",
      reflection:
        "下节课我会减少一次性讲解时长，把时间腾给‘学生讲步骤+当堂纠错’，并把易错点写成可视化检查清单，帮助学生把会做变成做对。",
    },
    quality: {
      passed: true,
      score: 88,
      issues: [],
    },
  };
}

export async function generateFeedback(userInput: string): Promise<GenerateResponse> {
  if (!apiKey) {
    return buildMock(userInput);
  }

  try {
    const extracted = {
      ...defaultExtracted,
      ...(await callOpenAIJson<Partial<ExtractedInfo>>(INFO_EXTRACTION_PROMPT, { userInput })),
    };

    const sceneResp = await callOpenAIJson<{ scene?: string }>(SCENE_CLASSIFICATION_PROMPT, {
      userInput,
      extracted,
    });

    const scene = sceneResp.scene || "作业讲评";

    let result = {
      ...defaultResult,
      ...(await callOpenAIJson<Partial<GeneratedResult>>(CONTENT_GENERATION_PROMPT, {
        userInput,
        extracted,
        scene,
      })),
    };

    let quality = {
      ...defaultQuality,
      ...(await callOpenAIJson<Partial<QualityReport>>(QUALITY_CHECK_PROMPT, {
        userInput,
        extracted,
        scene,
        result,
      })),
    };

    if (quality.score < 80) {
      result = {
        ...defaultResult,
        ...(await callOpenAIJson<Partial<GeneratedResult>>(REWRITE_PROMPT, {
          userInput,
          extracted,
          scene,
          result,
          qualityIssues: quality.issues,
        })),
      };

      quality = {
        ...defaultQuality,
        ...(await callOpenAIJson<Partial<QualityReport>>(QUALITY_CHECK_PROMPT, {
          userInput,
          extracted,
          scene,
          result,
        })),
      };
    }

    return {
      extracted,
      scene,
      result,
      quality,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return {
      extracted: defaultExtracted,
      scene: "作业讲评",
      result: {
        lecture_outline: "模型调用失败，请检查 API Key、Base URL 或模型名称。",
        error_analysis: "",
        remediation: "",
        parent_feedback: "",
        reflection: "",
      },
      quality: {
        passed: false,
        score: 0,
        issues: [`模型调用失败：${errorMessage}`],
      },
    };
  }
}
