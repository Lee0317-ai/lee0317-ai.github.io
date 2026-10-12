// 诊断 /index 白屏与 localStorage 拒绝
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 200)));

// 1. 真实登录（context.request）
const tRes = await page.context().request.get('http://127.0.0.1:48080/admin-api/system/tenant/get-id-by-name?name=gooyoo');
const tenantId = (await tRes.json()).data;
const loginRes = await page.context().request.post('http://127.0.0.1:48080/admin-api/system/auth/login', {
  headers: { 'tenant-id': String(tenantId) },
  data: { username: process.env.GOOYOO_USER, password: process.env.GOOYOO_PASS },
});
const body = await loginRes.json();
console.log('login code:', body.code);

// 2. 先落到 /login（同 origin 正常文档），再注入令牌
await page.goto('http://localhost:8080/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.evaluate(({ at, rt, tid }) => {
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap(at));
  localStorage.setItem('REFRESH_TOKEN', wrap(rt));
  localStorage.setItem('tenantId', wrap(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });
console.log('tokens injected on /login');

// 3. 带令牌进 /index
await page.goto('http://localhost:8080/index', { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('goto FAIL:', e.message.slice(0, 100)));
await page.waitForTimeout(6000);
console.log('url:', page.url());
console.log('has token:', await page.evaluate(() => !!localStorage.getItem('ACCESS_TOKEN')).catch(e => 'EVAL FAIL ' + String(e).slice(0, 80)));
console.log('body head:', JSON.stringify((await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 120)));
await page.screenshot({ path: 'assets/screenshots/_probe/gooyoo-diag.png' });
await browser.close();
