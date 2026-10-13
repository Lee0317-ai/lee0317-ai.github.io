// WOS 桌面 Agent 正式截图：等引擎就绪 → 首页/新建任务/技能与连接器/我的项目
import { _electron as electron } from 'playwright';
import path from 'node:path';

const APP_DIR = 'D:/Work/myplace/agent-os';
const OUT = 'assets/screenshots/wos';
const exe = 'D:/Work/myplace/agent-os/node_modules/electron/dist/electron.exe';

const app = await electron.launch({
  executablePath: exe,
  args: [path.join(APP_DIR)],
  cwd: APP_DIR,
  env: { ...process.env, ELECTRON_START_URL: 'http://localhost:5175', NODE_ENV: 'development' },
  timeout: 120000,
});
const win = await app.firstWindow();
await win.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});

// 等 AI 引擎启动完成（最长 3 分钟）
let engineReady = false;
for (let i = 0; i < 60; i++) {
  await win.waitForTimeout(3000);
  const t = (await win.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
  if (!t.includes('AI 引擎启动中') && !t.includes('正在启动网关')) { engineReady = true; break; }
  if (i % 10 === 0) console.log(`waiting engine... ${i * 3}s`);
}
console.log('engineReady:', engineReady);
await win.waitForTimeout(3000);
await win.screenshot({ path: `${OUT}/01-home.png` });
console.log('shot: 01-home');

const shot = async (name) => { await win.waitForTimeout(2500); await win.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot:', name); };
const closeOverlays = async () => { for (const k of ['取消', '关闭', '以后再说']) { const b = win.locator(`button:has-text("${k}")`).first(); if (await b.count() && await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await win.waitForTimeout(600); } } };

// 新建任务对话框
await win.locator('text=新建任务').first().click({ timeout: 8000 }).catch(e => console.log('新建任务 FAIL', e.message.slice(0, 50)));
await shot('02-newtask.png'.replace('.png', ''));
await closeOverlays();
await win.keyboard.press('Escape').catch(() => {});
await win.waitForTimeout(600);

// 技能与连接器
await win.locator('text=技能与连接器').first().click({ timeout: 8000 }).catch(e => console.log('技能 FAIL', e.message.slice(0, 50)));
await shot('03-skills');

// 我的项目
await win.locator('text=我的项目').first().click({ timeout: 8000 }).catch(e => console.log('我的项目 FAIL', e.message.slice(0, 50)));
await shot('04-projects');

await app.close();
console.log('done');
