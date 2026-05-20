"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";

const serviceCards = [
  {
    title: "效率工具",
    text: "把老师每天重复写、重复改、重复整理的工作，做成能直接用的小工具。",
  },
  {
    title: "AI讲堂",
    text: "不教复杂概念，只教老师在备课、讲评、沟通中真正用得上的 AI 方法。",
  },
  {
    title: "减负工具",
    text: "围绕作业反馈、家校沟通、班主任文案、学情分析，减少低效劳动。",
  },
];

export default function HomePage() {
  const [photoSrc, setPhotoSrc] = useState("/profile-photo.jpg");

  function onPickPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoSrc(URL.createObjectURL(file));
  }

  return (
    <main className="page">
      <section className="topNav">
        <strong>村长教师AI实验室</strong>
        <button type="button">联系我</button>
      </section>

      <section className="hero">
        <div className="heroLeft">
          <p className="kicker">30年教育一线经验 · 教师AI工具实践者</p>
          <h1>有困难，找村长。</h1>
          <p>
            我是村长，30年教育一线经验。不谈空泛AI概念，只专门解决老师真实问题：AI素养测评、名师课堂设计、作业讲评、能力卡点诊断等。
          </p>
          <div className="chips">
            <span>AI素养测评</span>
            <span>课堂设计</span>
            <span>作业讲评</span>
            <span>分层作业</span>
          </div>
        </div>

        <aside className="heroCard">
          <Image
            src={photoSrc}
            alt="个人主页照片"
            className="portrait"
            width={420}
            height={560}
            priority
            unoptimized
          />
          <label className="uploadBtn">
            更换照片
            <input type="file" accept="image/*" onChange={onPickPhoto} />
          </label>
          <h2>村长</h2>
          <h3>教师AI工具设计者</h3>
          <p>做了30年教育，最想解决的不是炫技问题，而是老师每天都绕不开的重复劳动。</p>
          <div className="stats">
            <div><b>30年</b><small>教育一线经验</small></div>
            <div><b>4类</b><small>工具方向</small></div>
            <div><b>1件事</b><small>先解真实问题</small></div>
          </div>
        </aside>
      </section>

      <section className="section">
        <p className="label">SERVICES</p>
        <h2>我现在正在做什么</h2>
        <div className="grid3">
          {serviceCards.map((card) => (
            <article key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
