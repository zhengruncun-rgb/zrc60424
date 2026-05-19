import { HERO_COPY } from "@/lib/copy";

export default function HomePage() {
  return (
    <main className="home">
      <section className="hero">
        <div>
          <p className="badge">Personal Brand Website</p>
          <h1>{HERO_COPY.title}</h1>
          <p className="lead">{HERO_COPY.subtitle}</p>

          <ul className="heroTags">
            {HERO_COPY.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className="heroTrust">{HERO_COPY.trustLine}</p>

          <div className="heroActions">
            <a className="btnPrimary" href="#contact">{HERO_COPY.ctaPrimary}</a>
            <a className="btnGhost" href="#services">查看服务方向</a>
          </div>
          <div className="heroCtaRow">
            <a className="heroLinkBtn" href="#services">{HERO_COPY.ctaSecondary}</a>
            <a className="heroLinkBtn" href="#contact">{HERO_COPY.ctaTertiary}</a>
          </div>
        </div>

        <div className="heroPhotoWrap" aria-label="个人主页视觉区域">
          <div className="photoAura" />
          <div className="heroPhoto" aria-hidden="true" />
          <p className="photoHint">这里后续可以替换为你的个人照片或品牌主视觉。</p>
        </div>
      </section>

      <section id="services" className="section">
        <h2>服务方向</h2>
        <div className="cards">
          <article>
            <h3>教师效率工具</h3>
            <p>围绕作业讲评、能力卡点诊断、家校沟通，把高频重复工作做成能直接用的小工具。</p>
          </article>
          <article>
            <h3>个人品牌官网</h3>
            <p>一屏讲清价值主张、服务边界与联系入口，让别人快速知道你是谁、能解决什么问题。</p>
          </article>
          <article>
            <h3>AI 落地顾问</h3>
            <p>结合真实业务场景做轻量接入，不堆概念，先做能用、能验证、能迭代的版本。</p>
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
