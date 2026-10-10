import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseProject, buildData } from '../scripts/build-content.mjs';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const SAMPLE = `---
name: demo
title: 演示项目
tagline: 一句话定位
status: shipped
role: 独立开发
stack: [React, Vite]
highlights:
  - 亮点一
  - 亮点二
links:
  demo: https://example.com
screenshots: []
order: 3
biz:
  - 业务价值一
---

正文第一段。

正文第二段。
`;

test('parseProject 解析 frontmatter 与正文', () => {
  const p = parseProject(SAMPLE);
  assert.equal(p.name, 'demo');
  assert.equal(p.status, 'shipped');
  assert.deepEqual(p.stack, ['React', 'Vite']);
  assert.deepEqual(p.biz, ['业务价值一']);
  assert.ok(p.narrativeHtml.includes('<p>正文第一段。</p>'));
});

test('parseProject 对裸键 null 值归一化为默认空值', () => {
  const src = SAMPLE.replace('stack: [React, Vite]', 'stack:').replace('links:\n  demo: https://example.com', 'links:');
  const p = parseProject(src);
  assert.deepEqual(p.stack, []);
  assert.deepEqual(p.links, {});
  assert.deepEqual(p.highlights, ['亮点一', '亮点二']);
});

test('parseProject 拒绝非法 status', () => {
  assert.throws(() => parseProject(SAMPLE.replace('status: shipped', 'status: done')), /status/);
});

test('parseProject 拒绝缺失 frontmatter', () => {
  assert.throws(() => parseProject('没有 frontmatter'), /frontmatter/);
});

test('buildData 按 order 升序排列并带 profile', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'content-'));
  await mkdir(path.join(dir, 'projects'));
  await writeFile(path.join(dir, 'profile.yaml'), 'name: Lee\nheadline: AI 全栈独立开发者\n');
  await writeFile(path.join(dir, 'projects', 'b.md'), SAMPLE);
  await writeFile(path.join(dir, 'projects', 'a.md'), SAMPLE.replace('name: demo', 'name: aaa').replace('order: 3', 'order: 1'));
  const data = await buildData(dir);
  assert.equal(data.profile.name, 'Lee');
  assert.equal(data.projects.length, 2);
  assert.equal(data.projects[0].name, 'aaa');
});
