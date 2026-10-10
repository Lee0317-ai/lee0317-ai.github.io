import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, renderHome, renderProject } from '../scripts/build-static.mjs';

const DATA = {
  profile: { name: 'Lee', handle: 'Lee0317-ai', github: 'https://github.com/Lee0317-ai',
    headline: 'AI 全栈独立开发者', intro: '简介', skills: [{ group: 'Agent 工程', items: ['LangGraph'] }] },
  projects: [{ name: 'demo', title: '演示项目', tagline: '定位', status: 'shipped', role: '独立开发',
    stack: ['React'], highlights: ['亮点一'], links: { demo: 'https://x' }, screenshots: [], order: 1,
    biz: ['业务价值'], narrativeHtml: '<p>正文</p>' }],
};

test('renderPage 填充标题与正文', () => {
  const html = renderPage('页面标题', '<p>主体</p>');
  assert.ok(html.includes('<title>页面标题</title>'));
  assert.ok(html.includes('<p>主体</p>'));
  assert.ok(html.includes('github.com/Lee0317-ai'));
});

test('renderHome 输出英雄区与项目卡片', () => {
  const html = renderHome(DATA);
  assert.ok(html.includes('AI 全栈独立开发者'));
  assert.ok(html.includes('演示项目'));
  assert.ok(html.includes('已上线')); // status badge 文案
});

test('renderProject 输出详情与业务价值', () => {
  const html = renderProject(DATA.projects[0], DATA);
  assert.ok(html.includes('演示项目'));
  assert.ok(html.includes('<p>正文</p>'));
  assert.ok(html.includes('业务价值'));
});

test('未知 status 渲染时抛错', () => {
  assert.throws(() => renderHome({ ...DATA, projects: [{ ...DATA.projects[0], status: 'x' }] }), /status/);
});
