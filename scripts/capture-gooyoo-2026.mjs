// gooyoo 平台 2026 新 UI 截图：门户首页 + 各子系统首页 + CRM 两个页面
// 用法：$env:GOOYOO_USER='...'; $env:GOOYOO_PASS='...'; node scripts/capture-gooyoo-2026.mjs
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8080';
const BASE = `http://localhost:${PORT}`;
const API = 'http://127.0.0.1:48080/admin-api';
const OUT = 'assets/screenshots/gooyoo';
const USER = process.env.GOOYOO_USER;
const PASS = process.env.GOOYOO_PASS;

const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
const SCRUB = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    let v = t.nodeValue;
    if (v.includes('万井然')) v = v.replaceAll('万井然', '集成平台');
    if (/\d{7,}/.test(v)) v = v.replace(/\d{7,}/g, (m) => m.slice(0, 3) + '****' + m.slice(-2));
    if (v.includes('@')) v = v.replace(/[\w.]+@[\w.]+/g, '***@***');
    t.nodeValue = v;
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 90)));

// 登录（context.request 免 CORS）
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);
const tRes = await page.context().request.get(`${API}/system/tenant/get-id-by-name?name=gooyoo`);
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post(`${API}/system/auth/login`, {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: USER, password: PASS },
});
const body = await loginRes.json();
if (body.code !== 0) { console.error('login fail', JSON.stringify(body).slice(0, 120)); process.exit(2); }
await page.evaluate(({ at, rt, tid }) => {
  const w = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', w(at));
  localStorage.setItem('REFRESH_TOKEN', w(rt));
  localStorage.setItem('tenantId', w(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

const shot = async (name) => {
  await page.evaluate(SCRUB).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot:', name);
};

// 1. 门户首页
await page.goto(BASE + '/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);
await shot('02-home');

// 2. 动态系统清单，逐系统首页
const ctxRes = await page.context().request.get(`${API}/system/portal/context`, { headers: { 'tenant-id': String(tenantId), Authorization: `Bearer ${body.data.accessToken}` } });
const ctx = await ctxRes.json();
const apps = ctx.data.apps || [];
console.log('系统清单:', apps.map(a => `${a.code}=${a.name}`).join(' | '));

for (const app of apps) {
  await page.goto(`${BASE}/portal/system-home?portalAppCode=${app.code}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log(app.code, 'goto FAIL', e.message.slice(0, 50)));
  await page.waitForTimeout(3500);
  // 展开折叠菜单（两轮处理嵌套；新 UI 选择器不同则静默跳过）
  for (let pass = 0; pass < 2; pass++) {
    const titles = page.locator('.el-sub-menu__title');
    const n = await titles.count();
    for (let i = 0; i < n; i++) await titles.nth(i).click({ timeout: 1200 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  await shot(`sys-${app.code}`);
  console.log('  ->', app.name);
}

// 3. CRM 客户与合同
for (const [name, route] of [['crm-customer', '/crm/customer'], ['crm-contract', '/crm/contract']]) {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log(name, 'goto FAIL', e.message.slice(0, 50)));
  await page.waitForTimeout(3500);
  await shot(name);
}

await browser.close();
console.log('done');
