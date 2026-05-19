"use client";

import { useState } from "react";

const WECHAT_ID = "zrc131331";

const tools = [
  {
    title: "智能作业分层助手",
    desc: "根据班级学情自动生成基础、提高、拓展三层作业。",
    image: "/work-layer.svg",
  },
  {
    title: "教师AI素养测评",
    desc: "从基础知识、教学应用、伦理安全、实操能力四个维度评估教师AI能力。",
  },
  {
    title: "语文名师课堂设计助手",
    desc: "围绕新课标、主问题和学习任务，快速生成课堂设计方案。",
  },
  {
    title: "课后讲评与反馈助手",
    desc: "把学生问题整理成讲评提纲、家长反馈和课后反思。",
  },
];

const services = [
  {
    title: "效率工具",
    text: "把老师高频重复工作做成能直接使用的小工具，先解决一个具体问题。",
  },
  {
    title: "AI讲堂",
    text: "不讲空泛概念，教老师真正能落地的AI备课、提问、讲评和办公方法。",
  },
  {
    title: "减负工具",
    text: "聚焦作业反馈、家校沟通、班主任文案、学情分析等真实减负场景。",
  },
];

export default function HomePage() {
  const [showWechat, setShowWechat] = useState(false);
  const [showDemand, setShowDemand] = useState(false);
  const [copied, setCopied] = useState(false);
  const [demand, setDemand] = useState("");

  async function copyWechat() {
    await navigator.clipboard.writeText(WECHAT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function copyDemand() {
    if (!demand.trim()) return;
    await navigator.clipboard.writeText(demand.trim());
  }

  return (
    <main className="siteShell">
      <nav className="topNav">
        <a className="brand" href="#top">村长教师AI实验室</a>
        <div className="navLinks">
          <a href="#works">作品</a>
          <a href="#services">服务方向</a>
          <a href="#why">为什么做</a>
          <button type="button" onClick={() => setShowWechat(true)}>联系我</button>
        </div>
      </nav>

      <section id="top" className="heroNew">
        <div className="heroCopy">
          <p className="eyebrow">30年教育一线经验 · 教师AI工具实践者</p>
          <h1>有困难，找村长。</h1>
          <p className="heroLead">
            我是村长，30年教育一线经验。我不谈空泛AI概念，只专门解决老师真实问题：教师AI素养测评、名师课堂设计、作业讲评、能力卡点诊断等。
          </p>
          <div className="pillRow">
            <span>AI素养测评</span><span>课堂设计</span><span>作业讲评</span><span>分层作业</span><span>班主任文案</span>
          </div>
          <div className="heroButtons">
            <a className="primaryBtn" href="#works">查看真实作品</a>
            <button className="secondaryBtn" type="button" onClick={() => setShowWechat(true)}>联系我</button>
            <button className="textBtn" type="button" onClick={() => setShowDemand(true)}>合作需求</button>
          </div>
        </div>

        <aside className="profilePanel">
          <div className="photoCard">
            <img src="/profile-photo.svg" alt="村长个人照片" />
          </div>
          <div className="profileInfo">
            <strong>村长</strong>
            <span>老师减负工具设计者</span>
          </div>
          <div className="statGrid">
            <div><b>30年</b><span>教育一线经验</span></div>
            <div><b>4类</b><span>真实工具方向</span></div>
            <div><b>1件事</b><span>先解决真实问题</span></div>
          </div>
        </aside>
      </section>

      <section id="services" className="sectionBlock">
        <div className="sectionTitle">
          <p>What I do</p>
          <h2>服务方向</h2>
        </div>
        <div className="serviceGrid">
          {services.map((item) => (
            <article className="serviceCard" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="works" className="sectionBlock worksBlock">
        <div className="sectionTitle wideTitle">
          <p>Real products</p>
          <h2>已落地作品</h2>
          <span>不是概念展示，都是围绕老师真实工作场景做出来的小工具。</span>
        </div>
        <div className="workGrid">
          {tools.map((tool, index) => (
            <article className="workCard" key={tool.title}>
              <div className="workPreview">
                {tool.image ? <img src={tool.image} alt={tool.title} /> : <div className="mockPreview">{tool.title}</div>}
              </div>
              <div className="workText">
                <span>作品 0{index + 1}</span>
                <h3>{tool.title}</h3>
                <p>{tool.desc}</p>
                <button type="button" onClick={() => setShowWechat(true)}>想体验这个</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="why" className="whyBlock">
        <div>
          <p className="eyebrow">Why</p>
          <h2>为什么做这些工具？</h2>
        </div>
        <p>
          做了30年教育，我发现很多老师不是不会教，而是被重复劳动拖垮了。真正消耗老师的，往往是反复讲评、整理反馈、家校沟通和大量低效文案。所以我开始把这些高频工作，做成真正能直接使用的小工具。
        </p>
      </section>

      <section id="contact" className="contactBlock">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>有具体问题，可以直接找我。</h2>
          <p>你给出真实场景，我给出可执行方案和落地路径。</p>
        </div>
        <div className="contactActions">
          <button type="button" onClick={() => setShowWechat(true)}>联系我</button>
          <button type="button" onClick={() => setShowDemand(true)}>合作需求</button>
        </div>
      </section>

      <footer className="footer">村长教师AI实验室 · 聚焦教师真实工作场景</footer>

      {showWechat && (
        <div className="modalMask" onClick={() => setShowWechat(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={() => setShowWechat(false)}>×</button>
            <h3>联系我</h3>
            <p>微信号</p>
            <div className="wechatBox">{WECHAT_ID}</div>
            <button className="primaryBtn full" type="button" onClick={copyWechat}>{copied ? "已复制" : "复制微信号"}</button>
          </div>
        </div>
      )}

      {showDemand && (
        <div className="modalMask" onClick={() => setShowDemand(false)}>
          <div className="modal demandModal" onClick={(e) => e.stopPropagation()}>
            <button className="modalClose" onClick={() => setShowDemand(false)}>×</button>
            <h3>合作需求</h3>
            <p>先把你的想法写下来，后续可以复制发给我。</p>
            <textarea value={demand} onChange={(e) => setDemand(e.target.value)} placeholder="例如：我是小学语文老师，想做一个作文讲评工具，希望能生成讲评提纲和家长反馈……" />
            <button className="primaryBtn full" type="button" onClick={copyDemand}>复制需求内容</button>
          </div>
        </div>
      )}
    </main>
  );
}
