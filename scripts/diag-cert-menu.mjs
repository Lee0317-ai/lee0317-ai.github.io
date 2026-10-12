import { chromium } from 'playwright';
const USER = process.env.GOOYOO_USER, PASS = process.env.GOOYOO_PASS;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:8080/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForSelector('input[placeholder="请输入密码"]', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(3000);
const tRes = await page.context().request.get('http://127.0.0.1:48080/admin-api/system/tenant/get-id-by-name?name=gooyoo');
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post('http://127.0.0.1:48080/admin-api/system/auth/login', {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: USER, password: PASS },
});
const body = await loginRes.json();
await page.evaluate(({ at, rt, tid }) => {
  const w = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', w(at)); localStorage.setItem('REFRESH_TOKEN', w(rt)); localStorage.setItem('tenantId', w(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });
await page.goto('http://localhost:8080/portal/system-home?portalAppCode=certificate', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);
const info = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.el-sub-menu').forEach((li) => {
    const title = li.querySelector('.el-sub-menu__title');
    if (!title) return;
    out.push({ text: title.textContent.trim().replace(/\n/g, ''), opened: li.className.includes('is-opened'), children: li.querySelectorAll('.el-menu-item').length });
  });
  return out;
});
console.log(JSON.stringify(info, null, 1));
// 尝试点击 企业证书 并观察
const t = page.locator('.el-sub-menu__title:has-text("企业证书")').first();
await t.click().catch(e => console.log('click err', e.message.slice(0, 80)));
await page.waitForTimeout(1200);
const after = await page.evaluate(() => {
  const li = [...document.querySelectorAll('.el-sub-menu')].find(l => l.querySelector('.el-sub-menu__title')?.textContent.includes('企业证书'));
  return { opened: li?.className.includes('is-opened'), items: li ? li.querySelectorAll('.el-menu-item').length : 0, url: location.pathname + location.hash };
});
console.log('after click:', JSON.stringify(after));
await browser.close();
