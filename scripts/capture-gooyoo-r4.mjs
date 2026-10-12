// gooyoo 平台第四轮：动态遍历 context.apps，每个系统「菜单全展开 + 系统首页」截图
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
    if (t.nodeValue.includes('万井然')) t.nodeValue = t.nodeValue.replaceAll('万井然', '集成平台');
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

// 登录（context.request 免 CORS）
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForSelector('input[placeholder="请输入密码"]', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(4000);
const tRes = await page.context().request.get(`${API}/system/tenant/get-id-by-name?name=gooyoo`);
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post(`${API}/system/auth/login`, {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: USER, password: PASS },
});
const body = await loginRes.json();
if (body.code !== 0) { console.error('login fail'); process.exit(2); }

// 注入令牌并进入门户
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.waitForTimeout(2500);
await page.evaluate(({ at, rt, tid }) => {
  const w = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', w(at));
  localStorage.setItem('REFRESH_TOKEN', w(rt));
  localStorage.setItem('tenantId', w(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

// 动态取真实系统清单
const ctxRes = await page.context().request.get(`${API}/system/portal/context`, { headers: { 'tenant-id': String(tenantId), Authorization: `Bearer ${body.data.accessToken}` } });
const ctx = await ctxRes.json();
const apps = ctx.data.apps || [];
console.log('系统清单:', apps.map(a => `${a.code}=${a.name}`).join(' | '));

// 逐系统：进入系统首页 → 全部展开菜单 → 脱敏 → 截图
for (const app of apps) {
  await page.goto(`${BASE}/portal/system-home?portalAppCode=${app.code}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log(app.code, 'goto FAIL', e.message.slice(0, 50)));
  await page.waitForTimeout(3000);
  // 展开所有折叠菜单（两轮处理嵌套）
  for (let pass = 0; pass < 2; pass++) {
    const titles = page.locator('.el-sub-menu__title');
    const n = await titles.count();
    for (let i = 0; i < n; i++) {
      await titles.nth(i).click({ timeout: 1500 }).catch(() => {});
    }
    await page.waitForTimeout(400);
  }
  await page.evaluate(SCRUB).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/sys-${app.code}.png` });
  console.log(`shot: sys-${app.code}.png (${app.name})`);
}

await browser.close();
console.log('done');
