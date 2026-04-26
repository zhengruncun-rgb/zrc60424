"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DEFAULT_PLACEHOLDER, SAMPLE_CASES } from "@/lib/prompts";

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
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<(typeof feedbackOptions)[number] | "">("");
  const [feedbackText, setFeedbackText] = useState("");
  const [modelMode, setModelMode] = useState<ModelMode>("auto");

  useEffect(() => {
    if (!loading) return;

    const timer = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  const cards = useMemo(
    () => [
      { title: "课堂讲评提纲", value: apiData?.result.lecture_outline ?? "" },
      { title: "共性错因分析", value: apiData?.result.error_analysis ?? "" },
      { title: "分层补救建议", value: apiData?.result.remediation ?? "" },
      { title: "家长反馈话术", value: apiData?.result.parent_feedback ?? "" },
      { title: "简短课后反思", value: apiData?.result.reflection ?? "" },
    ],
    [apiData],
  );

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!userInput.trim()) {
      setMessage("请先输入课堂描述。");
      return;
    }

    setLoading(true);
    setLoadingIndex(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput, modelMode }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || data.error) {
        setMessage(data.error ?? "生成失败，请稍后重试。");
        return;
      }

      setApiData(data);
      setMessage(data.quality.passed ? "已生成，可直接复制使用。" : "已生成，建议先微调后使用。");
    } catch {
      setMessage("网络异常，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function copyCard(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setMessage("已复制到剪贴板。");
  }

  function submitFeedback() {
    const payload = {
      selectedFeedback,
      feedbackText,
      timestamp: new Date().toISOString(),
      hasResult: Boolean(apiData),
    };
    console.log("feedback", payload);
    setMessage("感谢反馈，已记录（当前版本仅保存在前端日志）。");
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>课后讲评与反馈助手</h1>
        <p>把作业、小测后的学生问题，快速整理成讲评提纲、家长反馈和课后反思。</p>
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
            {loading ? loadingSteps[loadingIndex] : "生成讲评与反馈"}
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
        </div>
      </form>

      <section className="grid">
        {cards.map((card) => (
          <article className="card" key={card.title}>
            <div className="cardHead">
              <h2>{card.title}</h2>
              <button type="button" className="copyBtn" onClick={() => copyCard(card.value)}>
                复制
              </button>
            </div>
            <pre>{card.value || "点击“生成讲评与反馈”后显示内容。"}</pre>
          </article>
        ))}
      </section>

      <section className="feedback">
        <h3>问题：这份内容你觉得能用吗？</h3>
        <div className="feedbackOptions">
          {feedbackOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={option === selectedFeedback ? "option active" : "option"}
              onClick={() => setSelectedFeedback(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <textarea
          className="input"
          rows={3}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="哪句话你觉得不像老师说的？可以直接写在这里。"
        />

        <button type="button" className="feedbackSubmit" onClick={submitFeedback}>
          提交反馈
        </button>
      </section>

      <footer>{message ? <p className="message">{message}</p> : null}</footer>
    </main>
  );
}
