// 证书系统最终版：三组菜单逐一确保展开（带验证重试）
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

const isOpened = (name) => page.evaluate((n) => {
  const li = [...document.querySelectorAll('.el-sub-menu')].find(l => l.querySelector('.el-sub-menu__title')?.textContent.trim() === n);
  return li ? li.className.includes('is-opened') : null;
}, name);

for (const name of ['企业证书', '个人证书', '到期管理']) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const opened = await isOpened(name);
    if (opened === true) { console.log(`${name}: 已展开`); break; }
    if (opened === null) { console.log(`${name}: 未找到菜单`); break; }
    await page.locator(`.el-sub-menu__title:has-text("${name}")`).first().click({ timeout: 3000 }).catch(e => console.log(`${name} click FAIL`, e.message.slice(0, 50)));
    await page.waitForTimeout(900);
  }
}

// 强制所有子菜单容器可见（防轮询重渲染折叠），随后立即截图
await page.evaluate(() => {
  document.querySelectorAll('.el-sub-menu > ul.el-menu').forEach((ul) => {
    ul.style.display = 'block';
    ul.style.height = 'auto';
    ul.style.overflow = 'visible';
    ul.style.visibility = 'visible';
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (t.nodeValue.includes('万井然')) t.nodeValue = t.nodeValue.replaceAll('万井然', '集成平台');
  }
});
await page.screenshot({ path: 'assets/screenshots/gooyoo/sys-certificate.png' });
console.log('shot: sys-certificate.png');
await browser.close();
