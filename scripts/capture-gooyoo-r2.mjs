// gooyoo 平台第二轮：系统 tab 过滤 + 进入子系统截功能页（真实后端）
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8080';
const BASE = `http://localhost:${PORT}`;
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
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 90)));

// 登录
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForSelector('input[placeholder="请输入密码"]', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(4000);
const tRes = await page.context().request.get('http://127.0.0.1:48080/admin-api/system/tenant/get-id-by-name?name=gooyoo');
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post('http://127.0.0.1:48080/admin-api/system/auth/login', {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: USER, password: PASS },
});
const body = await loginRes.json();
if (body.code !== 0) { console.error('login fail', JSON.stringify(body).slice(0, 120)); process.exit(2); }
await page.evaluate(({ at, rt, tid }) => {
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap(at));
  localStorage.setItem('REFRESH_TOKEN', wrap(rt));
  localStorage.setItem('tenantId', wrap(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

// 进入门户
await page.goto(BASE + '/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);
const scrubShot = async (name) => {
  await page.evaluate(SCRUB).catch(() => {});
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot:', name);
};

// 1. 门户滚动到图表区
await page.evaluate(() => window.scrollTo(0, 900)).catch(() => {});
await page.waitForTimeout(1500);
await scrubShot('03-home-charts');
await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
await page.waitForTimeout(800);

// 2. 逐系统 tab：证书管理系统 / 投标管理系统
for (const tab of ['证书管理系统', '投标管理系统']) {
  const el = page.locator(`text=${tab}`).first();
  await el.click({ timeout: 8000 }).catch(e => console.log(`tab ${tab} FAIL`, e.message.slice(0, 50)));
  await page.waitForTimeout(3000);
  await scrubShot(`04-tab-${tab}`);
}

// 3. 点击第一个系统卡片「进入」子系统（证书管理系统）
await page.locator('text=综合').first().click({ timeout: 8000 }).catch(() => {});
await page.waitForTimeout(2000);
const card = page.locator('text=证书管理系统').first();
await card.click({ timeout: 8000 }).catch(e => console.log('card click FAIL', e.message.slice(0, 50)));
await page.waitForTimeout(6000);
console.log('after enter url:', page.url());
await scrubShot('05-subsystem-home');
const side = await page.locator('.el-menu-item, .el-sub-menu__title').allInnerTexts().catch(() => []);
console.log('SUB-SIDEBAR:', side.map(t => t.trim().replace(/\n/g, '/')).filter(Boolean).slice(0, 40).join(' | '));

// 4. 子系统里点前两个菜单页
const subItems = await page.locator('.el-menu-item').allInnerTexts();
const names = subItems.map(t => t.trim().replace(/\n/g, '')).filter(t => t && t.length < 12).slice(0, 2);
for (let i = 0; i < names.length; i++) {
  await page.locator(`.el-menu-item:has-text("${names[i]}")`).first().click({ timeout: 8000 }).catch(e => console.log(`menu ${names[i]} FAIL`, e.message.slice(0, 50)));
  await page.waitForTimeout(3500);
  await scrubShot(`06-sub-${i + 1}.png`.replace('.png', ''));
}

await browser.close();
console.log('done');
