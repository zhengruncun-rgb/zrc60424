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

const loadingSteps = ["正在判断能力卡点……", "正在整理讲评顺序……", "正在生成可复制内容……"];

const feedbackOptions = ["可以直接用", "改一改能用", "太空了", "不像老师说话", "没解决我的问题"] as const;

const painPoints = [
  ["知道错了，但说不清卡在哪", "老师不是不会讲答案，而是难在把学生错误翻译成能力问题。"],
  ["讲评课容易变成从头讲题", "题讲完了，学生下次换个说法还是错，说明方法没有迁移。"],
  ["反馈和反思又要重新组织", "课堂讲法、家长反馈、教学反思常常要重复整理三遍。"],
];

const workflowSteps = [
  ["01", "输入学生怎么错", "写年级、学科、题目和典型错法，不需要写成正式材料。"],
  ["02", "先诊断能力卡点", "先看审题、方法理解、步骤监控、表达规范等真正卡点。"],
  ["03", "整理明天怎么讲", "生成讲评重点、追问、变式检测、反馈和反思。"],
];

const toolkitItems = ["公开课磨课助手", "班主任通知模板", "教学反思助手", "AI减负案例库"];
const toolboxItems = ["✓ 讲评助手", "✓ 公开课磨课助手（开发中）", "✓ 分层作业助手（开发中）"];

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
      if (copiedResetTimerRef.current) clearTimeout(copiedResetTimerRef.current);
    };
  }, []);

  const summaryText = useMemo(() => {
    if (!apiData) return "输入学生典型错误后，这里会先显示“学生主要卡点、讲评重点、推荐讲法”。";

    const cardPoints = apiData.result.error_analysis.split("\n").filter(Boolean).slice(0, 2).join("\n");
    const methodPoints = apiData.result.lecture_outline.split("\n").filter(Boolean).slice(0, 2).join("\n");

    return `学生主要卡点：\n${cardPoints}\n\n讲评重点：\n先抓最关键能力缺口，再用1道同构题当堂复检，确认是否真正会做。\n\n推荐讲法：\n${methodPoints}`;
  }, [apiData]);

  const cards = useMemo(
    () => [
      ["能力卡点诊断", apiData?.result.error_analysis ?? ""],
      ["推荐讲法", apiData?.result.lecture_outline ?? ""],
      ["课堂追问与变式检测", apiData?.result.remediation ?? ""],
      ["家长反馈", apiData?.result.parent_feedback ?? ""],
      ["教学反思", apiData?.result.reflection ?? ""],
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
      if (copiedResetTimerRef.current) clearTimeout(copiedResetTimerRef.current);
      copiedResetTimerRef.current = setTimeout(() => setCopiedCardTitle(""), 1500);
    } catch {
      setMessage("复制失败，请手动选择复制。");
    }
  }

  function submitFeedback() {
    console.log("feedback", {
      selectedFeedback,
      feedbackText,
      timestamp: new Date().toISOString(),
      hasResult: Boolean(apiData),
    });
    setMessage("感谢反馈，已记录（当前版本仅保存在前端日志）。");
  }

  return (
    <main>
      <nav className="topNav" aria-label="主导航">
        <a className="brand" href="#top">村长说教育</a>
        <div>
          <a href="#why">为什么做</a>
          <a href="#case">真实案例</a>
          <a href="#tool">免费体验</a>
          <a href="#toolbox">教师AI工具箱</a>
          <a className="navCta" href="#qr-codes">领取教师AI工具包</a>
        </div>
      </nav>

      <section className="heroBand" id="top">
        <div className="heroInner">
          <div className="heroCopy">
            <span className="eyebrow">课后讲评与反馈助手</span>
            <h1>讲评课最难的，从来不是讲题</h1>
            <p>
              而是不知道学生到底错在哪。把学生怎么错说清楚，AI帮你整理明天能讲的讲评建议。
            </p>
            <div className="heroActions">
              <button type="button" className="primary" onClick={scrollToTool}>立即免费体验</button>
              <button type="button" className="secondary" onClick={fillRecommendedCase}>一键填充示例</button>
            </div>
            <div className="trustRow">
              <span>1995年参加教育工作</span>
              <span>面向一线教师真实场景</span>
              <span>不讲AI概念，先解决具体工作</span>
            </div>
          </div>

          <aside className="productPreview heroStoryCard" aria-label="产品预览">
            <div className="scenePanel">
              <span>办公室里的真实一刻</span>
              <strong>晚上 11:08</strong>
              <p>试卷、作业本、红笔摊在桌上。老师知道学生错了，却还要把明天怎么讲重新理一遍。</p>
            </div>
            <div className="previewOutput">
              <b>AI先帮老师理清</b>
              <ul>
                <li>学生真正卡在哪个能力点</li>
                <li>明天讲评先讲什么、后讲什么</li>
                <li>用哪一道变式题当堂检测</li>
              </ul>
            </div>
            <div className="previewNote">不是替老师讲课，而是帮老师把讲评思路先整理出来。</div>
          </aside>
        </div>
      </section>

      <section className="section" id="why">
        <div className="sectionHead">
          <span className="eyebrow">为什么做这个工具？</span>
          <h2>老师常卡住的不是答案，而是这三件事</h2>
        </div>
        <div className="painGrid">
          {painPoints.map(([title, text]) => (
            <article className="softCard" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section workflowSection">
        <div className="sectionHead">
          <span className="eyebrow">使用流程</span>
          <h2>从学生错误到明天讲法，只走三步</h2>
        </div>
        <div className="workflowGrid">
          {workflowSteps.map(([number, title, text]) => (
            <article className="stepCard" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section caseSection" id="case">
        <div className="sectionHead">
          <span className="eyebrow">先看一个作业讲评例子</span>
          <h2>真实老师案例</h2>
        </div>
        <div className="caseCompare">
          <article className="casePanel">
            <span>李老师｜五年级语文｜阅读理解</span>
            <pre>{`全班45人，18人失分。

题目：
老汉是个怎样的人？
请结合两处内容回答。

学生主要问题：
只抄一句原文，
不会“观点+依据”作答。`}</pre>
          </article>
          <article className="casePanel outputPanel">
            <span>AI生成结果</span>
            <ul>
              <li>能力卡点：没有先概括人物特点，只会摘抄文本</li>
              <li>推荐讲法：先圈题干“怎样的人”，再补“观点+依据”框架</li>
              <li>课堂追问：这处描写能证明老汉的哪个特点？</li>
              <li>变式检测：换一个人物，让学生独立写出一组观点和依据</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section aboutSection">
        <div>
          <span className="eyebrow">我是谁</span>
          <h2>村长，一个长期在教育现场的人</h2>
        </div>
        <p>
          1995年参加教育工作，长期关注一线老师备课、讲评、反馈和减负问题。现在尝试把AI翻译成老师能直接用的流程，先从公开课、课后讲评、班主任工作和教学反思这些真实场景做起。
        </p>
      </section>

      <section className="toolSection" id="tool" ref={toolRef}>
        <div className="toolHeader">
          <div>
            <span className="eyebrow">免费体验</span>
            <h2>把学生怎么错说清楚，AI再帮你整理明天怎么讲</h2>
          </div>
          <button type="button" className="secondary" onClick={fillRecommendedCase}>一键填充示例</button>
        </div>

        <form className="toolPanel" onSubmit={handleGenerate}>
          <div className="inputGuide">
            <strong>输入建议</strong>
            <p>请按老师平时描述方式输入：年级/学科/本次内容 + 学生具体怎么错 + 班级整体情况。</p>
          </div>

          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={DEFAULT_PLACEHOLDER}
            rows={7}
            className="input"
          />

          {showModelMode ? (
            <label className="devOnly">
              模型模式（开发）
              <select className="input" value={modelMode} onChange={(e) => setModelMode(e.target.value as ModelMode)}>
                <option value="mock">mock：模拟数据</option>
                <option value="auto">auto：自动读取环境变量</option>
                <option value="deepseek">deepseek：DeepSeek</option>
                <option value="kimi">kimi：Kimi</option>
                <option value="openai">openai：OpenAI</option>
              </select>
            </label>
          ) : null}

          <div className="actions">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? loadingSteps[loadingIndex] : "生成能力诊断与讲评建议"}
            </button>
            <div className="sampleRow">
              {SAMPLE_CASES.map((item) => (
                <button key={item.label} type="button" className="sampleBtn" onClick={() => setUserInput(item.text)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        <section className="resultArea" aria-label="生成结果">
          <article className="resultSummary">
            <h2>明天可以这样讲</h2>
            <pre>{summaryText}</pre>
          </article>

          <div className="resultCards">
            {cards.map(([title, value]) => (
              <article className="resultDetail" key={title}>
                <div className="resultCardHeader">
                  <span>{title}</span>
                  <button
                    type="button"
                    className="copyBtn"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      copyCard(title, value);
                    }}
                  >
                    {copiedCardTitle === title ? "已复制" : "复制"}
                  </button>
                </div>
                <pre>{value || "这一块暂时没生成完整，可以先复制上面的能力卡点诊断，再重新生成一次。"}</pre>
              </article>
            ))}
          </div>
        </section>

        {apiData ? (
          <section className="afterResultCta">
            <div>
              <span className="eyebrow">这个结果有帮助吗？</span>
              <h2>领取更多教师AI工具</h2>
              <p>加入教师AI实验群，后续一起测试公开课磨课、教学反思、班主任通知等小工具。</p>
            </div>
            <a className="primary linkButton" href="#qr-codes">加入实验群</a>
          </section>
        ) : null}
      </section>

      <section className="leadBand" id="qr-codes">
        <div className="leadCopy">
          <span className="eyebrow">领取教师AI工具包</span>
          <h2>想继续试更多教师场景，可以先加入教师AI实验群</h2>
          <div className="toolkitList">
            {toolkitItems.map((item) => <span key={item}>✓ {item}</span>)}
          </div>
        </div>
        <div className="qrGrid">
          <figure>
            <Image src="/images/teacher-ai-group.jpg" width={220} height={302} alt="教师AI实验群微信二维码" />
            <figcaption>扫码加村长，进入教师AI实验群</figcaption>
          </figure>
          <figure>
            <Image src="/images/wechat-official-account.jpg" width={220} height={220} alt="村长说教育公众号二维码" />
            <figcaption>关注公众号，领取后续工具更新</figcaption>
          </figure>
        </div>
      </section>

      <section className="feedback">
        <h3>这份内容你觉得能用吗？</h3>
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
        <button type="button" className="feedbackSubmit" onClick={submitFeedback}>提交反馈</button>
      </section>

      <section className="section toolboxSection" id="toolbox">
        <div className="sectionHead">
          <span className="eyebrow">教师AI工具箱</span>
          <h2>围绕老师高频任务，慢慢做成一套能用的小工具</h2>
        </div>
        <div className="toolboxList">
          {toolboxItems.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <footer>
        {message ? <p className="message">{message}</p> : null}
        <p className="message">
          {icpText ? <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">{icpText}</a> : null}
          {icpText && beianText ? " ｜ " : null}
          {beianText ? <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank" rel="noreferrer">{beianText}</a> : null}
        </p>
      </footer>
    </main>
  );
}
