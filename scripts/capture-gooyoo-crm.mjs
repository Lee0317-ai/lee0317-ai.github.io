// gooyoo CRM 模块截图（真实后端；客户名称可能为真实数据，首轮采集仅用于审读）
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8080';
const BASE = `http://localhost:${PORT}`;
const OUT = 'assets/screenshots/gooyoo-crm';
const USER = process.env.GOOYOO_USER;
const PASS = process.env.GOOYOO_PASS;

const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

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
  const w = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', w(at));
  localStorage.setItem('REFRESH_TOKEN', w(rt));
  localStorage.setItem('tenantId', w(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

const STOPS = [
  ['01-customer', '/crm/customer'],
  ['02-clue', '/crm/clue'],
  ['03-contract', '/crm/contract'],
  ['04-receivable', '/crm/receivable'],
  ['05-business', '/crm/business'],
  ['06-statistics', '/crm/statistics'],
];

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

for (const [name, route] of STOPS) {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log(name, 'goto FAIL', e.message.slice(0, 50)));
  await page.waitForTimeout(3500);
  const nf = await page.locator('text=您访问的页面不存在').count();
  await page.evaluate(SCRUB).catch(() => {});
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`shot: ${name} ${nf ? '(404)' : 'url=' + page.url()}`);
}

await browser.close();
console.log('done');
