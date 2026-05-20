"use client";

import { useState } from "react";

const WECHAT_ID = "zrc131331";

const works = [
  ["智能作业分层助手", "按班级学情生成基础、提高、拓展三层作业。", "分层作业"],
  ["教师AI素养测评", "四个维度评估教师AI能力，并给出提升建议。", "AI测评"],
  ["语文名师课堂设计助手", "围绕新课标生成主问题、学习任务和课堂流程。", "课堂设计"],
  ["课后讲评与反馈助手", "自动整理讲评提纲、家长反馈和课后反思。", "讲评反馈"],
];

const services = [
  ["效率工具", "把作业讲评、家校沟通、文案整理等重复工作做成小工具。"],
  ["AI讲堂", "不讲空泛概念，只讲老师能马上用起来的AI方法。"],
  ["减负工具", "围绕真实教学场景，减少老师低效、重复、耗时的工作。"],
];

export default function HomePage() {
  const [wechatOpen, setWechatOpen] = useState(false);
  const [demandOpen, setDemandOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [demand, setDemand] = useState("");

  async function copyWechat() {
    await navigator.clipboard.writeText(WECHAT_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function copyDemand() {
    if (demand.trim()) await navigator.clipboard.writeText(demand.trim());
  }

  return (
    <main className="page">
      <nav className="nav">
        <a className="logo" href="#top">村长教师AI实验室</a>
        <div className="navMenu">
          <a href="#works">作品</a>
          <a href="#services">服务</a>
          <a href="#why">理念</a>
          <button onClick={() => setWechatOpen(true)}>联系我</button>
        </div>
      </nav>

      <section id="top" className="hero">
        <div className="heroText">
          <p className="kicker">30年教育一线经验 · 教师AI工具实践者</p>
          <h1>有困难，找村长。</h1>
          <p className="lead">我是村长，30年教育一线经验。不谈空泛AI概念，只专门解决老师真实问题：AI素养测评、名师课堂设计、作业讲评、能力卡点诊断等。</p>
          <div className="chips"><span>AI素养测评</span><span>课堂设计</span><span>作业讲评</span><span>分层作业</span></div>
          <div className="actions"><a href="#works" className="primary">看真实作品</a><button className="ghost" onClick={() => setWechatOpen(true)}>联系我</button><button className="plain" onClick={() => setDemandOpen(true)}>合作需求</button></div>
        </div>

        <aside className="personCard">
          <div className="portraitMark">村长</div>
          <h2>教师AI工具设计者</h2>
          <p>做了30年教育，最想解决的不是炫技问题，而是老师每天都绕不开的重复劳动。</p>
          <div className="facts"><div><b>30年</b><span>教育一线经验</span></div><div><b>4类</b><span>工具方向</span></div><div><b>1件事</b><span>先解决真问题</span></div></div>
        </aside>
      </section>

      <section id="services" className="block">
        <p className="sectionKicker">SERVICES</p><h2>我现在正在做什么</h2>
        <div className="serviceGrid">{services.map(([title, text]) => <article className="service" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section id="works" className="block">
        <p className="sectionKicker">WORKS</p><h2>已落地作品</h2><p className="sub">不是概念展示，都是围绕老师真实工作场景做出来的小工具。</p>
        <div className="workGrid">{works.map(([title, text, label], i) => <article className="work" key={title}><div className="screen"><span>{label}</span><strong>{title}</strong><small>真实产品方向 0{i + 1}</small></div><div className="workBody"><h3>{title}</h3><p>{text}</p><button onClick={() => setWechatOpen(true)}>想体验这个</button></div></article>)}</div>
      </section>

      <section id="why" className="why"><div><p className="sectionKicker">WHY</p><h2>为什么做这些工具？</h2></div><p>做了30年教育，我发现很多老师不是不会教，而是被重复劳动拖垮了。真正消耗老师的，往往是反复讲评、整理反馈、家校沟通和大量低效文案。所以我开始把这些高频工作，做成真正能直接使用的小工具。</p></section>

      <section className="contact"><div><p className="sectionKicker">CONTACT</p><h2>有具体问题，可以直接找我。</h2><p>你给出真实场景，我给出可执行方案和落地路径。</p></div><div className="contactBtns"><button onClick={() => setWechatOpen(true)}>联系我</button><button onClick={() => setDemandOpen(true)}>合作需求</button></div></section>
      <footer>村长教师AI实验室 · 聚焦教师真实工作场景</footer>

      {wechatOpen && <div className="mask" onClick={() => setWechatOpen(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setWechatOpen(false)}>×</button><h3>联系我</h3><p>微信号</p><div className="wechat">{WECHAT_ID}</div><button className="primary full" onClick={copyWechat}>{copied ? "已复制" : "复制微信号"}</button></div></div>}
      {demandOpen && <div className="mask" onClick={() => setDemandOpen(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setDemandOpen(false)}>×</button><h3>合作需求</h3><p>把需求写下来，再复制发给我。</p><textarea value={demand} onChange={(e) => setDemand(e.target.value)} placeholder="例如：我是小学语文老师，想做一个作文讲评工具……" /><button className="primary full" onClick={copyDemand}>复制需求内容</button></div></div>}
    </main>
  );
}
