// 探查：进入系统按钮的跳转行为 + 各子系统路由
import { chromium } from 'playwright';

const USER = process.env.GOOYOO_USER;
const PASS = process.env.GOOYOO_PASS;
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
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap(at));
  localStorage.setItem('REFRESH_TOKEN', wrap(rt));
  localStorage.setItem('tenantId', wrap(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

// 监听新窗口
page.on('popup', async (p) => {
  console.log('POPUP OPENED:', p.url());
  await p.waitForTimeout(4000);
  console.log('POPUP final:', p.url());
  const side = await p.locator('.el-menu-item, .el-sub-menu__title').allInnerTexts().catch(() => []);
  console.log('POPUP SIDEBAR:', side.map(t => t.trim().replace(/\n/g, '/')).filter(Boolean).slice(0, 50).join(' | '));
  await p.close().catch(() => {});
});

await page.goto('http://localhost:8080/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);

// 找「进入系统」按钮并点击（证书系统概览卡片上的）
await page.locator('text=证书管理系统').first().click().catch(() => {});
await page.waitForTimeout(2500);
const enterBtn = page.locator('button:has-text("进入系统")').first();
if (await enterBtn.count()) {
  console.log('found 进入系统 button, clicking…');
  await enterBtn.click().catch(e => console.log('enter FAIL', e.message.slice(0, 60)));
  await page.waitForTimeout(5000);
  console.log('main page url after enter:', page.url());
} else {
  console.log('no 进入系统 button found');
}

// 兜底：试常见子系统直连路由
for (const r of ['/certificate', '/certificate/index', '/bidding/dashboard', '/project']) {
  await page.goto('http://localhost:8080' + r, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const notFound = await page.locator('text=您访问的页面不存在').count();
  console.log(`route ${r}: ${notFound ? '404' : 'OK -> ' + page.url()}`);
}
await browser.close();
