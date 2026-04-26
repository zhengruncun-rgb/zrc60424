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
    grade: "四年级",
    subject: "数学",
    lesson_content: "三位数乘两位数（竖式计算与应用题）",
    main_errors: ["竖式数位对不齐", "进位后漏加", "应用题读题不完整"],
    class_situation: "多数学生能列竖式，但在位值对齐、进位检查和应用题关键信息提取上不稳定。",
    desired_outputs: ["讲评提纲", "错因分析", "分层补救", "家长反馈", "课后反思"],
    tone: "务实、温和、可直接落地",
    missing_info: [],
  };

  return {
    extracted,
    scene: userInput.includes("小测") ? "小测反馈" : "作业讲评",
    result: {
      lecture_outline: `1）先用两道错例做开场：一题数位错位、一题进位漏加，请学生先判断错在第几步，再说理由，先抓“看出错点”而不是急着重算。
2）板书规范竖式：用颜色标出相同数位必须上下对齐，特别提醒第二行部分积左移一位，带着学生边写边口述“个位对个位、十位对十位”。
3）聚焦进位漏加：把“乘、写、进、加”拆成四步口令，示范一题后让学生同桌互查进位数字是否落在正确位置，再当堂订正错题。
4）讲应用题读题：先圈“已知、所求、单位”，再补全条件，要求学生把题意用一句完整的话复述后再列式，纠正只看数字就动笔的习惯。
5）最后做一题课堂过关：先独立完成，再用检查清单自评（数位、进位、单位、答句），教师按清单快速反馈并收尾。`,
      error_analysis: `错误表现1：竖式里部分积位置偏移，结果差很多。背后原因：位值概念不牢，把“左移一位”当成记忆口号，没有和十位乘法意义对应。讲评抓手：每次写第二行前先说“这一位表示几个十”，再落笔。
错误表现2：乘完会写进位，但最后合并时漏加。背后原因：步骤自动化不够，注意力只放在当前一行，没形成回看进位的检查动作。讲评抓手：固定“算完一列就点一下进位”的手势和口令，训练程序化检查。
错误表现3：应用题能列出乘法却常列错式或答非所问。背后原因：读题只抓数字，不完整理解关系和问题。讲评抓手：要求先复述“谁和谁比、求什么”，不复述清楚不允许列式。`,
      remediation: `基础薄弱学生：①每天5分钟做“对齐模板题”，只练竖式书写与部分积位置，先保证格式稳定；②给进位标记框，要求每做完一列必须把进位圈出并在下一列核对一次。
中等学生：①做“错因回放”练习，每题后写一句“我这题最可能错在哪”；②应用题采用“三线读题法”（条件线、问题线、单位线），再列式并写完整答句。
掌握较好学生：①完成一题多解或变式题，对比不同数据下进位变化并讲给同伴听；②担任小组检查员，按“数位—进位—单位”清单给同伴反馈，提升表达与迁移能力。`,
      parent_feedback:
        "各位家长好，今天我们集中讲评了四年级数学“三位数乘两位数”。孩子们整体思路在进步，当前主要卡在三处：竖式数位对齐不稳、进位后偶尔漏加、应用题读题不够完整。学校会继续用“示范+当堂订正+清单检查”帮助孩子把步骤做扎实。今晚建议陪孩子用10分钟完成1道同类题，做完请他说一遍“先对齐、再进位、后检查”的过程即可，不需要额外加量练习。",
      reflection:
        "今天讲评时我发现，学生不是不会算，而是步骤不稳定。下节课我要减少我讲的时间，增加学生口述和互查，让“对齐、进位、读题”变成可执行的固定动作。",
    },
    quality: {
      passed: true,
      score: 93,
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
