// gooyoo 企业平台管理端截图 v4（真实后端 + 真实登录；凭据走环境变量；万井然→集成平台 DOM 脱敏）
// 用法: GOOYOO_USER=... GOOYOO_PASS=... node scripts/capture-gooyoo.mjs <port> [phase]
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8080';
const BASE = `http://localhost:${PORT}`;
const API = 'http://127.0.0.1:48080/admin-api';
const OUT = 'assets/screenshots/gooyoo';
const USER = process.env.GOOYOO_USER;
const PASS = process.env.GOOYOO_PASS;
if (!USER || !PASS) {
  console.error('需要环境变量 GOOYOO_USER / GOOYOO_PASS');
  process.exit(1);
}

const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
const SCRUB = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (t.nodeValue.includes('万井然')) t.nodeValue = t.nodeValue.replaceAll('万井然', '集成平台');
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 90)));

// 1. 登录页截图（真实页面）
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForSelector('input[placeholder="请输入密码"]', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(4000);
await page.evaluate(SCRUB);
await page.screenshot({ path: `${OUT}/01-login.png` });
console.log('shot: 01-login');

// 2. 真实登录（context.request 免 CORS），按 web-storage-cache 格式注入令牌
const tRes = await page.context().request.get('http://127.0.0.1:48080/admin-api/system/tenant/get-id-by-name?name=gooyoo');
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post('http://127.0.0.1:48080/admin-api/system/auth/login', {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: USER, password: PASS },
});
const loginBody = await loginRes.json();
const loginResult = { ok: loginBody.code === 0, err: loginBody.code === 0 ? '' : JSON.stringify(loginBody).slice(0, 160) };
console.log('loginResult:', JSON.stringify(loginResult));
if (!loginResult.ok) {
  await browser.close();
  process.exit(2);
}
// 落到 /login 真实文档后再注入令牌（避免 error page 上 localStorage 被拒）
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.evaluate(({ at, rt, tid }) => {
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap(at));
  localStorage.setItem('REFRESH_TOKEN', wrap(rt));
  localStorage.setItem('tenantId', wrap(tid));
}, { at: loginBody.data.accessToken, rt: loginBody.data.refreshToken, tid: tenantId });
console.log('tokens injected');

// 3. 进入首页（真实菜单），脱敏 + 截图 + 导出菜单结构
await page.goto(BASE + '/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);
await page.evaluate(SCRUB);
await page.screenshot({ path: `${OUT}/02-home.png` });
console.log('shot: 02-home');

const menu = await page.evaluate(() => {
  const items = document.querySelectorAll('.el-menu-item, .el-sub-menu__title');
  return Array.from(items).map((el) => {
    const depth = (el.className.match(/el-menu--inline/) ? 1 : 0) || (el.closest('.el-menu .el-menu') ? 2 : 1);
    return { text: el.textContent.trim().replace(/\s+/g, '/'), level: el.closest('.el-menu .el-menu') ? 2 : 1 };
  });
});
console.log('SIDEBAR:', menu.map(m => `${m.level === 1 ? '■' : '·'}${m.text}`).join(' | ').slice(0, 3000));

await browser.close();
console.log('done — 用 SIDEBAR 清单确定第二轮要截的模块路由');
