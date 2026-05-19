"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PLACEHOLDER, SAMPLE_CASES } from "@/lib/prompts";
import { FORM_COPY, HERO_COPY } from "@/lib/copy";

type ApiResponse = {
  extracted: {
    grade: string;
    subject: string;
    lesson_content: string;
    main_errors: string[];
    class_situation: string;
    desired_outputs: string[];
    tone: string;
    missing_info: string[];
  };
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
  error?: string;
};

type ModelMode = "mock" | "auto" | "deepseek" | "kimi" | "openai";

const loadingSteps = [
  "正在整理学生问题……",
  "正在生成讲评提纲……",
  "正在检查表达是否像老师说话……",
];

const feedbackOptions = [
  "可以直接用",
  "改一改能用",
  "太空了",
  "不像老师说话",
  "没解决我的问题",
] as const;

export default function HomePage() {
  return (
    <main className="container">
      <header className="hero">
        <h1>{HERO_COPY.title}</h1>
        <p>{HERO_COPY.subtitle}</p>
        <ul className="heroTags">
          {HERO_COPY.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <p className="heroTrust">{HERO_COPY.trustLine}</p>
      </header>

      <form className="panel" onSubmit={handleGenerate}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={DEFAULT_PLACEHOLDER}
          rows={8}
          className="input"
        />

        <label>
          模型模式
          <select
            className="input"
            value={modelMode}
            onChange={(e) => setModelMode(e.target.value as ModelMode)}
          >
            <option value="mock">mock：模拟数据</option>
            <option value="auto">auto：自动读取环境变量</option>
            <option value="deepseek">deepseek：DeepSeek</option>
            <option value="kimi">kimi：Kimi</option>
            <option value="openai">openai：OpenAI</option>
          </select>
        </label>
        <p className="message">
          mock：不调用真实模型，适合演示；auto：使用 .env.local 中配置的模型；deepseek/kimi/openai：后续可按环境变量切换
        </p>

        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? loadingSteps[loadingIndex] : FORM_COPY.submitLabel}
          </button>

          <div className="sampleRow">
            {SAMPLE_CASES.map((item) => (
              <button
                key={item.label}
                type="button"
                className="sampleBtn"
                onClick={() => setUserInput(item.text)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="heroCtaRow">
            <button type="button" className="heroLinkBtn">{HERO_COPY.ctaSecondary}</button>
            <button type="button" className="heroLinkBtn">{HERO_COPY.ctaTertiary}</button>
          </div>
        </div>

        <div className="heroPhotoWrap" aria-label="个人主页照片">
          <div className="photoAura" />
          <Image src="/profile-photo.jpg" alt="个人主页照片" className="heroPhoto" width={840} height={1120} priority />
          <p className="photoHint">艺术处理：胶片质感 + 冷暖分离 + 柔光边框</p>
        </div>
      </section>

      <section id="services" className="section">
        <h2>服务方向</h2>
        <div className="cards">
          <article>
            <h3>内容生产提效</h3>
            <p>把选题、脚本、生成、复用变成固定流程，减少重复劳动。</p>
          </article>
          <article>
            <h3>个人品牌官网</h3>
            <p>一屏讲清价值主张、服务边界与联系入口，提升信任和转化。</p>
          </article>
          <article>
            <h3>AI 落地顾问</h3>
            <p>结合真实业务场景做轻量接入，不堆概念，先做能用的版本。</p>
          </article>
        </div>
      </section>

      <section id="contact" className="section contact">
        <h2>合作方式</h2>
        <p>微信优先。你给出真实场景，我给出可执行方案和落地路径。</p>
        <div className="contactActions">
          <button type="button">复制微信号</button>
          <button type="button">发送合作需求</button>
        </div>
      </section>
    </main>
  );
}
