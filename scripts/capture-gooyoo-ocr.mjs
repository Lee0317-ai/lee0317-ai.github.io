// gooyoo-ocr 合同比对工作台截图（前端 Vite；后端不在线，界面壳 + 示例状态）
import { chromium } from 'playwright';

const PORT = process.argv[2] || '5173';
const BASE = `http://localhost:${PORT}`;
const OUT = 'assets/screenshots/gooyoo-ocr';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));

// 拦截所有后端调用（Java 网关/Python 服务均不在线），返回友好空态
await page.route('**/**', (route) => {
  const u = route.request().url();
  if (u.startsWith(BASE)) return route.continue();
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: null, msg: '' }) });
});

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);
console.log('entry url:', page.url());
await page.screenshot({ path: `${OUT}/01-workbench.png` });
console.log('shot: 01-workbench');

const btns = await page.locator('button, a, [role=button]').allInnerTexts().catch(() => []);
console.log('ELEMENTS:', btns.map(b => b.trim()).filter(Boolean).slice(0, 20).join(' | '));
await browser.close();
errs.length && console.log('PAGE ERRORS:', [...new Set(errs)].slice(0, 4));
