import Image from "next/image";
export default function HomePage() {
  return (
    <main className="home">
      <section className="hero">
        <div className="heroText">
          <p className="badge">Personal Brand Website</p>
          <h1>务实做事，把教育场景里的复杂问题做成简单方案。</h1>
          <p className="lead">
            我专注中小学教育场景，提供内容提效、品牌展示与 AI 工具落地服务。
            不讲空话，只交付能上线、能使用、能推进结果的页面与流程。
          </p>
          <div className="heroActions">
            <a href="#contact" className="btnPrimary">联系我</a>
            <a href="#services" className="btnGhost">查看服务</a>
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
