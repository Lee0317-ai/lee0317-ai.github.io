// WOS 正式采集 v2：关联工作目录展开 + 真实会话内容
import { _electron as electron } from 'playwright';
import path from 'node:path';

const APP_DIR = 'D:/Work/myplace/agent-os';
const exe = 'D:/Work/myplace/agent-os/node_modules/electron/dist/electron.exe';
const OUT = 'assets/screenshots/wos';

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

// 1. 展开三个项目文件夹
for (const name of ['测试工作', 'riley-auth', 'project']) {
  await win.locator(`text=${name}`).first().click({ timeout: 8000 }).catch(e => console.log(`${name} FAIL`));
  await win.waitForTimeout(1500);
}
await win.screenshot({ path: `${OUT}/05-projects-expanded.png` });
console.log('shot: 05-projects-expanded');

// 2. 打开测试工作下的真实会话：帮我检查我文件夹下面有哪些内容
await win.locator('text=帮我检查我文件夹下面有哪些内容').first().click({ timeout: 8000 })
  .catch(e => console.log('session1 FAIL', e.message.slice(0, 50)));
await win.waitForTimeout(6000);
await win.screenshot({ path: `${OUT}/06-session-folder-check.png` });
console.log('shot: 06-session-folder-check');

// 3. 修复这个报错 会话
await win.locator('text=修复这个报错').first().click({ timeout: 8000 })
  .catch(e => console.log('session2 FAIL', e.message.slice(0, 50)));
await win.waitForTimeout(6000);
await win.screenshot({ path: `${OUT}/07-session-fix.png` });
console.log('shot: 07-session-fix');

await app.close();
console.log('done');
