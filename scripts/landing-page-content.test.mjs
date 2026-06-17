import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const page = readFileSync("app/page.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");
const ai = readFileSync("lib/ai.ts", "utf8");

[
  "讲评课最难的，从来不是讲题",
  "而是不知道学生到底错在哪",
  "办公室里的真实一刻",
  "晚上 11:08",
  "不是替老师讲课",
  "先看一个作业讲评例子",
  "老师常卡住的不是答案，而是这三件事",
  "从学生错误到明天讲法，只走三步",
  "真实老师案例",
  "李老师｜五年级语文｜阅读理解",
  "观点+依据",
  "1995年参加教育工作",
  "领取教师AI工具包",
  "加入教师AI实验群",
  "一键填充示例",
  "这个结果有帮助吗？",
  "领取更多教师AI工具",
  "教师AI工具箱",
  "公开课磨课助手（开发中）",
  "分层作业助手（开发中）",
  "productPreview",
  "workflowGrid",
  "painGrid",
].forEach((text) => {
  assert.ok(page.includes(text), `Missing landing page copy: ${text}`);
});

[
  "public/images/wechat-official-account.jpg",
  "public/images/teacher-ai-group.jpg",
].forEach((assetPath) => {
  assert.ok(existsSync(assetPath), `Missing asset: ${assetPath}`);
});

assert.ok(css.includes("#0f5a46"), "Expected warm ink-green primary color");
assert.ok(css.includes(".navCta"), "Top navigation should include a lead-capture CTA");
assert.ok(css.includes("Source Han Serif SC"), "Hero and section headings should use a warmer serif stack");
assert.ok(css.includes(".scenePanel"), "Hero should include a teacher-scene visual panel");
assert.ok(!css.includes("#2855ff"), "Old technology-blue primary color should be removed");
assert.ok(!css.includes("font-size: clamp(34px, 6vw, 66px)"), "Hero headline should not be oversized");
assert.ok(page.includes("这一块暂时没生成完整"), "Empty result modules need a teacher-friendly fallback");
assert.ok(!page.includes("<details className=\"resultDetail\""), "Generated result cards should stay expanded, not hidden behind accordions");
assert.ok(css.includes("resultCardHeader"), "Expanded result cards need a visible card header");
assert.ok(ai.includes("completeResult"), "Generated result should be completed before rendering");
