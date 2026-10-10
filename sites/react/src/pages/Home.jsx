import React from 'react';
import { Link } from 'react-router-dom';

const LABEL = { shipped: '已上线', wip: '开发中', planned: '规划中', adapted: '改编维护' };

export default function Home({ data }) {
  const { profile, projects } = data;
  return (
    <>
      <section className="hero">
        <h1>{profile.name} · {profile.headline}</h1>
        <p className="intro">{profile.intro}</p>
        <div className="skill-chips">
          {profile.skills.flatMap(s => s.items.map((i, k) => <span className="chip" key={s.group + k}>{i}</span>))}
        </div>
      </section>
      <h2 className="section" id="projects">作品（{projects.length}）</h2>
      <div className="grid">
        {projects.map(p => (
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
    </>
  );
}
