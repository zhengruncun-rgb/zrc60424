import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ai = readFileSync("lib/ai.ts", "utf8");

assert.ok(ai.includes("function detectSubject"), "Fallback generation should detect the subject before writing advice");
assert.ok(ai.includes("观点+依据"), "Chinese reading fallback should address reading-answer structure");
assert.ok(ai.includes("音形对应"), "English fallback should address spelling/listening issues");
assert.ok(ai.includes("数量关系"), "Math fallback should address quantity relationships");
assert.ok(ai.includes("ensureSubjectAlignment"), "Model output should be checked against the input subject");
assert.ok(ai.includes("hasMathLeak"), "Chinese reading output should reject math-topic leakage");
assert.ok(!ai.includes("观点|依据|原文|阅读|人物|表达|题干|文本|概括"), "Generic words like 题干 should not let math output pass as Chinese reading output");
assert.ok(!ai.includes("lecture_outline: `模型调用失败"), "Model failures should not leave most result cards empty");
