// 监听门户加载的全部 API，找 context/apps 接口并打印 appCode 清单
import { chromium } from 'playwright';

const USER = process.env.GOOYOO_USER;
const PASS = process.env.GOOYOO_PASS;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const seen = new Set();
page.on('response', async (r) => {
  const u = r.url();
  if (!u.includes('/admin-api/')) return;
  const path = u.slice(u.indexOf('/admin-api/') + 11).split('?')[0];
  if (seen.has(path)) return;
  seen.add(path);
  let body = '';
  try { body = (await r.text()).slice(0, 400); } catch {}
  console.log('API:', path, '|', body.slice(0, 260));
});

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

await page.goto('http://localhost:8080/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(8000);
await browser.close();
