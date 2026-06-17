"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PLACEHOLDER, SAMPLE_CASES } from "@/lib/prompts";

type ApiResponse = {
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
  error?: string;
};

type ModelMode = "mock" | "auto" | "deepseek" | "kimi" | "openai";

const loadingSteps = [
  "正在判断学生卡点……",
  "正在生成可直接上课的讲法……",
  "正在整理可复制内容……",
];

const feedbackOptions = [
  "可以直接用",
  "改一改能用",
  "太空了",
  "不像老师说话",
  "没解决我的问题",
] as const;

const toolkitItems = ["公开课磨课助手", "班主任通知模板", "教学反思助手", "AI减负案例库"];

const toolboxItems = ["讲评助手", "磨课助手", "分层作业助手"];

export default function HomePage() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<(typeof feedbackOptions)[number] | "">("");
  const [feedbackText, setFeedbackText] = useState("");
  const [modelMode, setModelMode] = useState<ModelMode>("auto");
  const [copiedCardTitle, setCopiedCardTitle] = useState("");
  const copiedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolRef = useRef<HTMLElement | null>(null);
  const showModelMode =
    process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SHOW_MODEL_MODE === "true";
  const icpText = process.env.NEXT_PUBLIC_ICP_NUMBER?.trim();
  const beianText = process.env.NEXT_PUBLIC_GA_BEIAN_NUMBER?.trim();

  useEffect(() => {
    if (!loading) return;

    const timer = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    return () => {
      if (copiedResetTimerRef.current) {
        clearTimeout(copiedResetTimerRef.current);
      }
    };
  }, []);

  const summaryText = useMemo(() => {
    if (!apiData) return "点击“生成能力诊断与讲评建议”后显示总览。";

    const cardPoints = apiData.result.error_analysis.split("\n").filter(Boolean).slice(0, 2).join("\n");
    const methodPoints = apiData.result.lecture_outline.split("\n").filter(Boolean).slice(0, 2).join("\n");

    return `学生主要卡点：\n${cardPoints}\n\n讲评重点：\n先抓最关键能力缺口，再用1道同构题当堂复检，确认是否真正会做。\n\n推荐讲法：\n${methodPoints}`;
  }, [apiData]);

  const cards = useMemo(
    () => [
      {
        title: "能力卡点诊断",
        value: apiData?.result.error_analysis ?? "",
      },
      {
        title: "推荐讲法",
        value: apiData?.result.lecture_outline ?? "",
      },
      { title: "课堂追问与变式检测", value: apiData?.result.remediation ?? "" },
      { title: "家长反馈", value: apiData?.result.parent_feedback ?? "" },
      { title: "教学反思", value: apiData?.result.reflection ?? "" },
    ],
    [apiData],
  );

  function scrollToTool() {
    toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fillRecommendedCase() {
    setUserInput(
      "五年级数学，分数应用题讲评。错误率约35%，主要问题是审题不清：有学生没有找准单位“1”，有学生把已知量和所求量混在一起，还有学生列式时先算了分母再处理分子。希望帮我判断学生卡在审题、数量关系还是方法迁移，并给出明天15分钟能讲清楚的讲评建议。",
    );
    scrollToTool();
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!userInput.trim()) {
      setMessage("请先输入学生典型错误。");
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

  async function copyCard(title: string, text: string) {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCardTitle(title);
      setMessage("已复制到剪贴板。");

      if (copiedResetTimerRef.current) {
        clearTimeout(copiedResetTimerRef.current);
      }

      copiedResetTimerRef.current = setTimeout(() => {
        setCopiedCardTitle("");
      }, 1500);
    } catch {
      setMessage("复制失败，请手动选择复制。");
    }
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
    <main className="pageShell">
      <nav className="topNav" aria-label="主导航">
        <strong>村长说教育</strong>
        <div>
          <a href="#story">为什么做</a>
          <a href="#case">真实案例</a>
          <a href="#tool">免费体验</a>
          <a href="#toolbox">教师AI工具箱</a>
        </div>
      </nav>

      <section className="hero">
        <div className="heroText">
          <span className="eyebrow">课后讲评与反馈助手</span>
          <h1>
            老师还在熬夜写讲评？
            <br />
            我把30年的教学经验做成了AI助手
          </h1>
          <p>
            输入学生典型错误，3分钟看清能力卡点，整理出明天能讲的讲评建议。
          </p>
          <div className="heroActions">
            <button type="button" className="primary" onClick={scrollToTool}>
              立即免费体验
            </button>
            <button type="button" className="secondary" onClick={fillRecommendedCase}>
              一键填充示例
            </button>
          </div>
        </div>

        <div className="heroPreview" aria-label="工具输出预览">
          <p className="previewLabel">明天可以这样讲</p>
          <h2>先判断学生卡在哪，再安排讲评顺序。</h2>
          <ul>
            <li>能力卡点诊断</li>
            <li>推荐讲法</li>
            <li>课堂追问与变式检测</li>
            <li>家长反馈与教学反思</li>
          </ul>
        </div>
      </section>

      <section className="storyBand" id="story">
        <div className="sectionIntro">
          <span className="eyebrow">为什么做这个工具？</span>
          <h2>不是让老师多学一个AI，而是少一点重复整理。</h2>
        </div>
        <div className="storyText">
          <p>去年，一个年轻老师晚上11点给我发消息。</p>
          <p>她说：“我知道学生哪里错了，但不知道怎么整理成讲评课，更不知道怎么写反馈。”</p>
          <p>
            后来我尝试把这个过程交给AI，把老师脑子里零散的判断，整理成能直接讲、能复制、能反馈的内容。
          </p>
          <p>原本40分钟的工作，缩短到了3分钟。于是有了这个工具。</p>
        </div>
      </section>

      <section className="caseSection" id="case">
        <div className="sectionIntro">
          <span className="eyebrow">一个真实案例</span>
          <h2>老师一看就知道该输入什么、能得到什么。</h2>
        </div>
        <div className="caseCompare">
          <article className="casePanel">
            <h3>输入内容</h3>
            <pre>{`五年级数学
分数乘法
错误率42%

主要问题：
单位不统一
计算顺序错误
不会说明为什么这样列式`}</pre>
          </article>

          <article className="casePanel highlightPanel">
            <h3>输出结果</h3>
            <ul>
              <li>学生主要卡在“单位量理解”和“数量关系表达”</li>
              <li>先让学生说清每一步算的是什么</li>
              <li>用一道同构题检查是否能迁移</li>
              <li>生成一段温和、具体的家长反馈</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="aboutSection">
        <div className="sectionIntro">
          <span className="eyebrow">我是谁</span>
          <h2>村长，一个长期在教育现场的人。</h2>
        </div>
        <p>
          1995年参加教育工作，长期关注一线老师备课、讲评、反馈和减负问题。现在尝试把AI翻译成老师能直接用的流程，先从公开课、课后讲评、班主任工作和教学反思这些真实场景做起。
        </p>
      </section>

      <section className="leadSection" id="lead">
        <div className="leadCopy">
          <span className="eyebrow">领取教师AI工具包</span>
          <h2>想继续试更多教师场景，可以先加入教师AI实验群。</h2>
          <div className="toolkitList">
            {toolkitItems.map((item) => (
              <span key={item}>✓ {item}</span>
            ))}
          </div>
          <a className="primary linkButton" href="#qr-codes">
            加入教师AI实验群
          </a>
        </div>
        <div className="qrGrid" id="qr-codes">
          <figure>
            <Image
              src="/images/teacher-ai-group.jpg"
              width={220}
              height={302}
              alt="教师AI实验群微信二维码"
            />
            <figcaption>扫码加村长，进入教师AI实验群</figcaption>
          </figure>
          <figure>
            <Image
              src="/images/wechat-official-account.jpg"
              width={220}
              height={220}
              alt="村长说教育公众号二维码"
            />
            <figcaption>关注公众号，领取后续工具更新</figcaption>
          </figure>
        </div>
      </section>

      <section className="toolSection" id="tool" ref={toolRef}>
        <div className="sectionIntro">
          <span className="eyebrow">免费体验</span>
          <h2>把学生怎么错说清楚，AI再帮你整理明天怎么讲。</h2>
          <p>不知道怎么写？试试这个案例：五年级数学，分数应用题，错误率35%，主要问题是审题不清。</p>
        </div>

        <form className="panel" onSubmit={handleGenerate}>
          <div className="inputGuide">
            <strong>输入建议</strong>
            <p>请按老师平时描述方式输入：年级/学科/本次内容 + 学生具体怎么错 + 班级整体情况。</p>
            <p>请尽量描述学生“怎么错的”，不要只写“哪道题错了”。</p>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={DEFAULT_PLACEHOLDER}
            rows={8}
            className="input"
          />

          {showModelMode ? (
            <>
              <label className="devOnly">
                模型模式（开发）
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
            </>
          ) : null}

          <div className="actions">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? loadingSteps[loadingIndex] : "生成能力诊断与讲评建议"}
            </button>

            <button type="button" className="secondary" onClick={fillRecommendedCase}>
              一键填充示例
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

        <section className="resultGrid" aria-label="生成结果">
          <article className="card resultSummary">
            <div className="cardHead">
              <h2>明天可以这样讲</h2>
            </div>
            <pre>{summaryText}</pre>
          </article>

          {cards.map((card) => (
            <details className="card resultDetail" key={card.title} open={card.title === "能力卡点诊断"}>
              <summary>
                <span>{card.title}</span>
                <button
                  type="button"
                  className="copyBtn"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyCard(card.title, card.value);
                  }}
                >
                  {copiedCardTitle === card.title ? "已复制" : "复制"}
                </button>
              </summary>
              <pre>{card.value || "这一块暂时没生成完整，可以先复制上面的能力卡点诊断，再重新生成一次。"}</pre>
            </details>
          ))}
        </section>

        {apiData ? (
          <section className="afterResultCta">
            <div>
              <span className="eyebrow">喜欢这个结果？</span>
              <h2>领取更多教师AI工具</h2>
              <p>加入教师AI实验群，后续一起测试公开课磨课、教学反思、班主任通知等小工具。</p>
            </div>
            <a className="primary linkButton" href="#qr-codes">
              加入实验群
            </a>
          </section>
        ) : null}
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

      <section className="toolboxSection" id="toolbox">
        <div className="sectionIntro">
          <span className="eyebrow">教师AI工具箱</span>
          <h2>以后不再做多个网站，围绕老师高频任务慢慢扩展。</h2>
        </div>
        <div className="toolboxList">
          {toolboxItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <footer>
        {message ? <p className="message">{message}</p> : null}
        <p className="message">
          {icpText ? (
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">
              {icpText}
            </a>
          ) : null}
          {icpText && beianText ? " ｜ " : null}
          {beianText ? (
            <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank" rel="noreferrer">
              {beianText}
            </a>
          ) : null}
        </p>
      </footer>
    </main>
  );
}
