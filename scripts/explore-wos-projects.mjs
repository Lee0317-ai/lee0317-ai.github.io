// WOS 探索（干净版）：项目文件夹展开 + 会话内容
import { _electron as electron } from 'playwright';
import path from 'node:path';

const APP_DIR = 'D:/Work/myplace/agent-os';
const exe = 'D:/Work/myplace/agent-os/node_modules/electron/dist/electron.exe';

const app = await electron.launch({
  executablePath: exe,
  args: [path.join(APP_DIR)],
  cwd: APP_DIR,
  env: { ...process.env, ELECTRON_START_URL: 'http://localhost:5175', NODE_ENV: 'development' },
  timeout: 120000,
});

let win = null;
for (let i = 0; i < 30 && !win; i++) {
  await new Promise(r => setTimeout(r, 2000));
  win = app.windows().find(w => !w.url().includes('devtools')) || null;
}
if (!win) { console.error('no app window'); process.exit(1); }
await win.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {});
await win.waitForTimeout(12000);
console.log('app url:', win.url());

const dumpSide = async (tag) => {
  const texts = win.locator('aside li, [class*=sidebar] li');
  const n = await texts.count();
  const arr = [];
  for (let i = 0; i < Math.min(n, 40); i++) {
    const t = (await texts.nth(i).innerText().catch(() => '')).trim().replace(/\s+/g, '/');
    if (t) arr.push(t);
  }
  console.log(`[${tag}] SIDEBAR ${n}:`, arr.join(' | '));
};

// 展开三个项目
for (const name of ['测试工作', 'riley-auth', 'project']) {
  await win.locator(`text=${name}`).first().click({ timeout: 6000 }).catch(e => console.log(`${name} FAIL`));
  await win.waitForTimeout(1200);
}
await dumpSide('expanded');
await win.screenshot({ path: 'assets/screenshots/_probe/wos-projects-expanded.png' });

// 点击侧栏第 7 个 li（第一个展开的子项）
const firstChild = win.locator('aside li').nth(6);
await firstChild.click({ timeout: 5000 }).catch(e => console.log('child click FAIL', e.message.slice(0, 40)));
await win.waitForTimeout(5000);
console.log('after child url:', win.url());
console.log('BODY:', JSON.stringify((await win.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 350)));
await win.screenshot({ path: 'assets/screenshots/_probe/wos-child.png' });

await app.close();
console.log('done');
