import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const page = readFileSync("app/page.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");
const ai = readFileSync("lib/ai.ts", "utf8");

[
  "课后讲评，不必再从一堆错题里硬熬",
  "输入学生典型错误，3分钟看清能力卡点，整理出明天能讲的讲评建议。",
  "先看一个作业讲评例子",
  "老师常卡住的不是答案，而是这三件事",
  "从学生错误到明天讲法，只走三步",
  "一个真实案例",
  "1995年参加教育工作",
  "领取教师AI工具包",
  "加入教师AI实验群",
  "一键填充示例",
  "领取更多教师AI工具",
  "教师AI工具箱",
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
assert.ok(!css.includes("#2855ff"), "Old technology-blue primary color should be removed");
assert.ok(!css.includes("font-size: clamp(34px, 6vw, 66px)"), "Hero headline should not be oversized");
assert.ok(page.includes("这一块暂时没生成完整"), "Empty result modules need a teacher-friendly fallback");
assert.ok(ai.includes("completeResult"), "Generated result should be completed before rendering");
