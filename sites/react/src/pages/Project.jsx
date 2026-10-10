import React from 'react';
import { useParams, Link } from 'react-router-dom';

const LABEL = { shipped: '已上线', wip: '开发中', planned: '规划中', adapted: '改编维护' };

export default function Project({ data }) {
  const { name } = useParams();
  const p = data.projects.find(x => x.name === name);
  if (!p) return <p>未找到该项目。<Link to="/">返回首页</Link></p>;
  return (
    <article className="detail">
      <p><Link to="/">← 全部作品</Link></p>
      <h1>{p.title} <span className={`badge ${p.status}`}>{LABEL[p.status]}</span></h1>
      <p className="muted">{p.tagline}</p>
      <div className="meta">
        <span>角色：{p.role || '独立开发'}</span>
        {p.links?.demo && <span><a href={p.links.demo} target="_blank" rel="noopener">线上访问</a></span>}
        {p.links?.repo && <span><a href={p.links.repo} target="_blank" rel="noopener">源码</a></span>}
      </div>
      <div className="stack-chips">{p.stack.map(s => <span className="chip" key={s}>{s}</span>)}</div>
      {p.screenshots?.length > 0 && <>
        <h2 className="section">功能截图</h2>
        {p.screenshots.map(s => <img className="shot" key={s} src={`/${s}`} alt={`${p.title} 截图`} loading="lazy" />)}
      </>}
      <h2 className="section">核心亮点</h2>
      <ul className="highlights">{p.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
      <div dangerouslySetInnerHTML={{ __html: p.narrativeHtml }} />
      <div className="biz-box"><strong>产品价值</strong>{p.biz.map((b, i) => <p key={i} style={{ margin: '4px 0' }}>{b}</p>)}</div>
    </article>
  );
}
