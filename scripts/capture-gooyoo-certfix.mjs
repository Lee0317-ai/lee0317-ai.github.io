// 证书管理系统重拍：企业证书/个人证书/到期管理 菜单全部展开（只点未展开的，避免误折叠）
import { chromium } from 'playwright';

const USER = process.env.GOOYOO_USER;
const PASS = process.env.GOOYOO_PASS;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto('http://localhost:8080/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForSelector('input[placeholder="请输入密码"]', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(4000);
const tRes = await page.context().request.get('http://127.0.0.1:48080/admin-api/system/tenant/get-id-by-name?name=gooyoo');
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post('http://127.0.0.1:48080/admin-api/system/auth/login', {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: USER, password: PASS },
});
const body = await loginRes.json();
await page.evaluate(({ at, rt, tid }) => {
  const w = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', w(at));
  localStorage.setItem('REFRESH_TOKEN', w(rt));
  localStorage.setItem('tenantId', w(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

await page.goto('http://localhost:8080/portal/system-home?portalAppCode=certificate', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);

// 只展开未打开的子菜单：每次点第一个未展开项（避免 NodeList 索引漂移），直到清零
for (let i = 0; i < 20; i++) {
  const closed = page.locator('.el-sub-menu:not(.is-opened) > .el-sub-menu__title').first();
  if (!(await closed.count())) { console.log(`all expanded after ${i} clicks`); break; }
  await closed.click({ timeout: 2000 }).catch(() => {});
  await page.waitForTimeout(350);
}

// 万井然 → 集成平台
await page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (t.nodeValue.includes('万井然')) t.nodeValue = t.nodeValue.replaceAll('万井然', '集成平台');
  }
});
await page.waitForTimeout(300);
await page.screenshot({ path: 'assets/screenshots/gooyoo/sys-certificate.png' });
console.log('shot: sys-certificate.png (菜单全展开)');
await browser.close();
