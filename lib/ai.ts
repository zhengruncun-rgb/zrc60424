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

type SubjectKind = "chinese" | "math" | "english" | "general";

function detectSubject(userInput: string): SubjectKind {
  if (/语文|阅读|作文|课文|原文|观点|依据|表达|人物|段落/.test(userInput)) return "chinese";
  if (/英语|单词|听写|拼写|字母|句型|Unit|unit|Thursday|brother|kitchen/i.test(userInput)) return "english";
  if (/数学|计算|分数|乘法|除法|应用题|数量|单位|列式|进位|位值/.test(userInput)) return "math";
  return "general";
}

function buildSubjectFallback(userInput: string): FeedbackResult {
  const subject = detectSubject(userInput);

  if (subject === "chinese") {
    return {
      error_analysis:
        "【能力卡点】学生表面上是答题不完整，背后主要卡在三处：一是没有先判断题目要回答“人物特点/原因/作用”中的哪一类；二是只会摘抄原文，不会把文本信息转成自己的观点；三是缺少“观点+依据”的表达框架。若不干预，后面遇到人物分析、内容概括、阅读简答题时还会反复丢分。",
      lecture_outline:
        "1. 先带学生圈出题干关键词，明确这题不是抄一句话，而是要先说观点。\n2. 再出示一份典型错误答案，让学生判断：这句话有没有观点？有没有依据？\n3. 板书答题句式：“我认为他是一个___的人，因为文中___，这说明___。”\n4. 最后让学生用同一句式重写自己的答案，当堂抽两份对照修改。",
      remediation:
        "【课堂追问】\n1. 题目问的是“写了什么”，还是“他是怎样的人”？\n2. 你准备先说观点，还是先抄原文？为什么？\n3. 这处描写能证明哪个人物特点？\n4. 如果只能保留一句依据，你会选哪一句？\n\n【变式检测】\n1. 换一个人物提问，让学生先写观点再找依据，看顺序是否正确。\n2. 给一段原文和两个观点，让学生匹配依据，看信息整合是否准确。\n3. 让学生把“只抄原文”的答案改成“观点+依据”，看表达是否完整。",
      parent_feedback:
        "今天阅读题中，孩子主要不是读不懂文章，而是答题时还不太会先提炼观点、再结合原文说明。建议在家做阅读题时，先让孩子口头说一句“我认为他是一个怎样的人”，再找文中依据。",
      reflection:
        "这次讲评提醒我，阅读题不能只讲标准答案，要先让学生看懂题目到底要什么。后续讲评时，我会把“审题关键词、观点提炼、依据表达”拆开训练，让学生形成可迁移的答题路径。",
    };
  }

  if (subject === "english") {
    return {
      error_analysis:
        "【能力卡点】学生表面上是单词写错，背后可能卡在音形对应、字母顺序记忆和书写规范三处。连续错同类词，说明不是偶然粗心，而是还没有形成“听音-拆音节-检查拼写”的稳定路径。",
      lecture_outline:
        "1. 先把典型错词写出来，让学生找出到底漏了哪个音、换了哪个字母。\n2. 再带学生按音节或字母组合拆词，不直接让学生死记整词。\n3. 最后做一分钟复听复写，要求学生写完后自己按发音逐段检查。",
      remediation:
        "【课堂追问】\n1. 你听到这个词时，先听到了哪几个音？\n2. 哪个字母组合最容易漏？\n3. 写完后你怎么检查顺序？\n4. 这个词放到句首时大小写要不要变？\n\n【变式检测】\n1. 给同类字母组合词，检查是否还能拼对。\n2. 把单词放进句子里听写，检查大小写和格式。\n3. 让学生互查一个错词，说清错在音、形还是规范。",
      parent_feedback:
        "今天听写中，孩子主要问题不是单个词没背，而是音和字母组合对应还不够稳定。建议在家复习时，不只默写整词，可以让孩子边读边拆，再写后检查容易漏的字母。",
      reflection:
        "这次讲评提醒我，听写错词要分类处理，不能只让学生订正三遍。后续我会把音形对应、拼写顺序和书写规范分开讲，再用同类词做当堂检测。",
    };
  }

  if (subject === "math") {
    return {
      error_analysis:
        "【能力卡点】学生表面上是算错，背后可能卡在审题路径、数量关系建模和步骤监控。讲评时不要急着报答案，先把学生每一步为什么这样做问出来。若不干预，换成同类应用题或多步计算时还会继续出错。",
      lecture_outline:
        "1. 先请学生复述题目问什么、已知什么，把关键数量关系说出来。\n2. 再对照典型错法，让学生判断自己是看错关系、列错式，还是计算过程失控。\n3. 最后用一道同构题当堂复检，重点看学生能不能说清每一步的依据。",
      remediation:
        "【课堂追问】\n1. 这道题先要找哪个量？\n2. 你这一步算出来的是什么？\n3. 为什么这样列式，而不是换一种列法？\n4. 做完后你准备检查哪一步？\n\n【变式检测】\n1. 换数字不换关系，检查是否真正理解数量关系。\n2. 换表述不换题型，检查审题是否稳定。\n3. 给一份错误列式，让学生判断错在关系还是计算。",
      parent_feedback:
        "今天练习中，孩子主要不是不会算，而是审题和数量关系整理还不够稳定。建议在家练习时，先让孩子说清题目问什么、每一步算的是什么，再动笔完成。",
      reflection:
        "这次讲评提醒我，计算和应用题不能只纠正结果，还要追问学生的思路来源。后续讲评时，我会先诊断能力卡点，再用同构题检查学生是否真正会迁移。",
    };
  }

  return {
    error_analysis:
      `【能力卡点】学生这次的典型错误是：${userInput}。建议先不要急着讲答案，先判断学生是卡在审题、方法理解、步骤监控，还是表达规范。`,
    lecture_outline:
      "1. 先让学生复述任务要求，说清自己第一步准备做什么。\n2. 再展示一个典型错误，让学生判断错在理解、方法还是步骤。\n3. 最后用一道同类小任务当堂复检，看学生能否迁移。",
    remediation:
      "【课堂追问】\n1. 题目真正要求你完成什么？\n2. 你第一步为什么这样做？\n3. 如果换一种说法，方法还一样吗？\n4. 做完后你怎么检查？\n\n【变式检测】\n给学生一个同类但表述略有变化的小任务，让学生先说思路再完成。",
    parent_feedback:
      "今天练习中，孩子主要问题不是不会做，而是完成任务前的理解和方法整理还不够稳定。建议在家练习时，先让孩子说清题目要求和准备怎么做，再动笔完成。",
    reflection:
      "这次讲评提醒我，不能只讲正确答案，还要先判断学生卡在哪个能力点。后续讲评时，我会先通过追问暴露学生思路，再用变式任务检查是否真正理解。",
  };
}

function buildMock(userInput: string): GenerateResponse {
  return {
    extracted: userInput,
    scene: "作业讲评",
    result: buildSubjectFallback(userInput),
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

function ensureSubjectAlignment(result: FeedbackResult, userInput: string): FeedbackResult {
  const subject = detectSubject(userInput);
  const output = Object.values(result).join("\n");

  const hasMathLeak = /进位|列式|算错|数量关系|单位量|加法|减法|乘法|除法|应用题|计算|同构题/.test(output);
  const hasChineseSignal = /观点|依据|原文|阅读|人物|表达|文本|概括/.test(output);
  const hasEnglishLeak = /单词|拼写|字母|音形|听写|句型|大小写/.test(output);
  const hasMathSignal = /数量关系|列式|计算|算理|进位|单位/.test(output);

  if (subject === "chinese" && hasMathLeak && !hasChineseSignal) {
    return buildSubjectFallback(userInput);
  }

  if (subject === "english" && hasMathLeak && !hasEnglishLeak) {
    return buildSubjectFallback(userInput);
  }

  if (subject === "math" && hasEnglishLeak && !hasMathSignal) {
    return buildSubjectFallback(userInput);
  }

  return result;
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

    const result = ensureSubjectAlignment(
      completeResult(extractJson(content) as Partial<FeedbackResult>, userInput),
      userInput,
    );

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
      result: buildSubjectFallback(userInput),
      quality: {
        passed: false,
        score: 60,
        issues: [message],
      },
    };
  }
}
