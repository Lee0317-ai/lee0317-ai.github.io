// WOS 启动诊断：主进程日志 + 窗口列表
import { _electron as electron } from 'playwright';
import path from 'node:path';

const APP_DIR = 'D:/Work/myplace/agent-os';
const browser = await electron.launch({
  executablePath: 'D:/Work/myplace/agent-os/node_modules/electron/dist/electron.exe',
  args: [path.join(APP_DIR)],
  cwd: APP_DIR,
  env: { ...process.env, ELECTRON_START_URL: 'http://localhost:5175', NODE_ENV: 'development' },
  timeout: 90000,
});
browser.process().stdout?.on('data', d => console.log('OUT:', d.toString().slice(0, 200)));
browser.process().stderr?.on('data', d => console.log('ERR:', d.toString().slice(0, 300)));

for (let i = 1; i <= 6; i++) {
  await new Promise(r => setTimeout(r, 10000));
  const wins = browser.windows();
  console.log(`t=${i * 10}s windows=${wins.length}`, wins.map(w => w.url().slice(0, 60)).join(' , '));
  if (wins.length > 0) {
    const w = wins[0];
    console.log('BODY:', JSON.stringify((await w.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 250)));
    await w.screenshot({ path: 'assets/screenshots/_probe/wos-diag.png' }).catch(() => {});
    break;
  }
}
await browser.close();
console.log('diag done');
