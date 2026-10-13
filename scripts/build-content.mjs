import { parse } from 'yaml';
import { marked } from 'marked';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const STATUSES = new Set(['shipped', 'wip', 'planned', 'adapted']);
const CATEGORIES = new Set(['agent', 'app', 'java', 'software', 'dotnet']);

export function parseProject(source) {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('缺少 frontmatter');
  const meta = parse(m[1]);
  if (!meta || typeof meta !== 'object') throw new Error('frontmatter 解析结果为空或非对象');
  if (!STATUSES.has(meta.status)) throw new Error(`非法 status: ${meta.status}（${meta.name}）`);
  if (meta.category != null && !CATEGORIES.has(meta.category)) throw new Error(`非法 category: ${meta.category}（${meta.name}）`);
  const biz = meta.biz == null ? [] : (Array.isArray(meta.biz) ? meta.biz : [meta.biz]);
  return {
    ...meta,
    category: meta.category == null ? 'app' : meta.category,
    links: meta.links == null ? {} : meta.links,
    screenshots: meta.screenshots == null ? [] : (Array.isArray(meta.screenshots) ? meta.screenshots : [meta.screenshots]),
    stack: meta.stack == null ? [] : (Array.isArray(meta.stack) ? meta.stack : [meta.stack]),
    highlights: meta.highlights == null ? [] : (Array.isArray(meta.highlights) ? meta.highlights : [meta.highlights]),
    biz,
    narrativeHtml: marked.parse(m[2].trim()),
  };
}

export async function buildData(contentDir) {
  const profile = parse(await readFile(path.join(contentDir, 'profile.yaml'), 'utf8'));
  const dir = path.join(contentDir, 'projects');
  const files = (await readdir(dir)).filter(f => f.endsWith('.md'));
  const projects = [];
  for (const f of files) {
    projects.push(parseProject(await readFile(path.join(dir, f), 'utf8')));
  }
  const catRank = (c) => ({ agent: 0, app: 1, java: 2, software: 3, dotnet: 4 }[c] ?? 9);
  projects.sort((a, b) => catRank(a.category) - catRank(b.category) || a.order - b.order);
  return { profile, projects };
}

if (import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, '/')}`).href ||
    import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())) {
  const data = await buildData(path.resolve('content'));
  await mkdir(path.dirname(path.resolve('data.json')), { recursive: true });
  await writeFile(path.resolve('data.json'), JSON.stringify(data, null, 2));
  console.log(`data.json: ${data.projects.length} 个项目`);
}
