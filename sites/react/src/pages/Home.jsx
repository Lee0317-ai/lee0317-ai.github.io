import React from 'react';
import { Link } from 'react-router-dom';

const LABEL = { shipped: '已上线', wip: '开发中', planned: '规划中', adapted: '改编维护' };
const CATEGORY_LABELS = { ai: 'AI 应用与智能体', java: '企业级 Java 全栈' };

export default function Home({ data }) {
  const { profile, projects } = data;
  const groups = Object.entries(CATEGORY_LABELS)
    .map(([key, label]) => ({ key, label, items: projects.filter(p => (p.category ?? 'ai') === key) }))
    .filter(g => g.items.length > 0);
  return (
    <>
      <section className="hero">
        <h1>{profile.name} · {profile.headline}</h1>
        <p className="intro">{profile.intro}</p>
        <div className="skill-chips">
          {profile.skills.flatMap(s => s.items.map((i, k) => <span className="chip" key={s.group + k}>{i}</span>))}
        </div>
      </section>
      {groups.map((g, gi) => (
        <React.Fragment key={g.key}>
          <h2 className="section" id={gi === 0 ? 'projects' : undefined}>{g.label}（{g.items.length}）</h2>
          <div className="grid">
            {g.items.map(p => (
              <Link className="card" key={p.name} to={`/project/${p.name}`}>
                {p.screenshots?.[0] && <img className="shot" src={`/${p.screenshots[0]}`} alt={`${p.title} 截图`} loading="lazy" />}
                <div className="card-body">
                  <h3>{p.title} <span className={`badge ${p.status}`}>{LABEL[p.status]}</span></h3>
                  <p className="muted">{p.tagline}</p>
                  <div className="stack-chips">{p.stack.map(s => <span className="chip" key={s}>{s}</span>)}</div>
                </div>
              </Link>
            ))}
          </div>
        </React.Fragment>
      ))}
    </>
  );
}
