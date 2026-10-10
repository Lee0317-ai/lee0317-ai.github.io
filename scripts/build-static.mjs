import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import path from 'node:path';

const STATUS_LABEL = { shipped: '已上线', wip: '开发中', planned: '规划中', adapted: '改编维护' };
const template = await readFile(path.resolve('sites/static/src/templates/page.template.html'), 'utf8');

export function renderPage(title, body) {
  return template.replace('{{title}}', title).replace('{{body}}', body);
}

function badge(status) {
  const label = STATUS_LABEL[status];
  if (!label) throw new Error(`未知 status: ${status}`);
  return `<span class="badge ${status}">${label}</span>`;
}

function chips(items) {
  return `<div class="stack-chips">${items.map(i => `<span class="chip">${i}</span>`).join('')}</div>`;
}

function shotImg(p, cls) {
  if (!p.screenshots?.length) return '';
  return `<img class="shot ${cls}" src="/${p.screenshots[0]}" alt="${p.title} 截图" loading="lazy">`;
}

function card(p) {
  return `<a class="card" href="/projects/${p.name}.html">
    ${shotImg(p, '')}
    <div class="card-body">
      <h3>${p.title} ${badge(p.status)}</h3>
      <p class="muted">${p.tagline}</p>
      ${chips(p.stack)}
    </div></a>`;
}

export function renderHome(data) {
  const skills = data.profile.skills.map(s =>
    s.items.map(i => `<span class="chip">${i}</span>`).join('')).join('');
  const body = `
<section class="hero">
  <h1>${data.profile.name} · ${data.profile.headline}</h1>
  <p class="intro">${data.profile.intro}</p>
  <div class="skill-chips">${skills}</div>
  <p class="muted" style="margin-top:14px">求职简历：
    <a href="/resume/resume-tech.html" target="_blank">技术深度版</a> ·
    <a href="/resume/resume-biz.html" target="_blank">产品业务版</a></p>
</section>
<h2 class="section" id="projects">作品（${data.projects.length}）</h2>
<div class="grid">${data.projects.map(card).join('\n')}</div>`;
  return renderPage(`${data.profile.name} · ${data.profile.headline}`, body);
}

export function renderProject(p, data) {
  const links = [];
  if (p.links?.demo) links.push(`<a href="${p.links.demo}" target="_blank" rel="noopener">线上访问</a>`);
  if (p.links?.repo) links.push(`<a href="${p.links.repo}" target="_blank" rel="noopener">源码</a>`);
  const shots = (p.screenshots || []).map(s =>
    `<img class="shot" src="/${s}" alt="${p.title} 截图" loading="lazy">`).join('\n');
  const body = `
<article class="detail">
  <p><a href="/#projects">← 全部作品</a></p>
  <h1>${p.title} ${badge(p.status)}</h1>
  <p class="muted">${p.tagline}</p>
  <div class="meta">
    <span>角色：${p.role || '独立开发'}</span>
    ${links.map(l => `<span>${l}</span>`).join('')}
  </div>
  ${chips(p.stack)}
  ${shots ? `<h2 class="section">功能截图</h2>${shots}` : ''}
  <h2 class="section">核心亮点</h2>
  <ul class="highlights">${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
  ${p.narrativeHtml}
  <div class="biz-box"><strong>产品价值</strong><br>${p.biz.join('<br>')}</div>
</article>`;
  return renderPage(`${p.title} · ${data.profile.name}`, body);
}

// ---------- 简历渲染（Task 4 复用） ----------
export function renderResume(data, variant) {
  const tech = variant === 'tech';
  const title = tech ? '简历 · 技术深度版' : '简历 · 产品业务版';
  const proj = data.projects.filter(p => p.status !== 'planned');
  const body = `
<section class="hero" style="padding-bottom:8px">
  <h1 style="font-size:26px">${data.profile.name} — ${data.profile.headline}</h1>
  <p class="muted">${tech ? data.profile.intro : data.profile.resumeNote} ·
    <a href="${data.profile.github}" target="_blank" rel="noopener">github.com/${data.profile.handle}</a></p>
</section>
<h2 class="section">技能</h2>
${data.profile.skills.map(s => `<p><strong>${s.group}</strong>：${s.items.join('、')}</p>`).join('\n')}
<h2 class="section">精选作品</h2>
${proj.map(p => `
  <h3 style="margin:14px 0 4px">${p.title} <span class="muted" style="font-weight:400">— ${p.tagline}</span></h3>
  <ul class="highlights">${(tech ? p.highlights : p.biz).map(h => `<li>${h}</li>`).join('')}</ul>`).join('\n')}`;
  return renderPage(title, body).replace('</head>', '<link rel="stylesheet" href="/assets/resume.css"></head>');
}

// ---------- 主流程 ----------
async function main() {
  const { buildData } = await import('./build-content.mjs');
  const data = await buildData(path.resolve('content'));
  await mkdir(path.resolve('dist/projects'), { recursive: true });
  await mkdir(path.resolve('dist/resume'), { recursive: true });
  await mkdir(path.resolve('dist/assets'), { recursive: true });
  await writeFile(path.resolve('dist/index.html'), renderHome(data));
  for (const p of data.projects) {
    await writeFile(path.resolve(`dist/projects/${p.name}.html`), renderProject(p, data));
  }
  await writeFile(path.resolve('dist/resume/resume-tech.html'), renderResume(data, 'tech'));
  await writeFile(path.resolve('dist/resume/resume-biz.html'), renderResume(data, 'biz'));
  await cp(path.resolve('sites/static/src/styles.css'), path.resolve('dist/assets/styles.css'));
  await cp(path.resolve('sites/static/src/resume.css'), path.resolve('dist/assets/resume.css'));
  await cp(path.resolve('sites/static/src/theme.js'), path.resolve('dist/assets/theme.js'));
  if (await exists('assets/screenshots')) {
    await cp(path.resolve('assets/screenshots'), path.resolve('dist/assets/screenshots'), { recursive: true });
  }
  console.log(`dist/: 首页 + ${data.projects.length} 个详情页 + 2 个简历页`);
}
async function exists(p) { try { await readdir(p); return true; } catch { return false; } }

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())) {
  await main();
}
