// gooyoo 平台第三轮：七大子系统逐个进入截图（真实后端）
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
if (body.code !== 0) { console.error('login fail'); process.exit(2); }
await page.evaluate(({ at, rt, tid }) => {
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap(at));
  localStorage.setItem('REFRESH_TOKEN', wrap(rt));
  localStorage.setItem('tenantId', wrap(tid));
}, { at: body.data.accessToken, rt: body.data.refreshToken, tid: tenantId });

const STOPS = [
  ['s1-cert-home', '/portal/system-home?portalAppCode=certificate'],
  ['s2-cert-list', '/certificate'],
  ['s3-bidding-dashboard', '/bidding/dashboard'],
  ['s4-project-home', '/portal/system-home?portalAppCode=project'],
  ['s5-project-list', '/project'],
  ['s6-document-home', '/portal/system-home?portalAppCode=document'],
  ['s7-inspection-home', '/portal/system-home?portalAppCode=inspection'],
  ['s8-wdyt-home', '/portal/system-home?portalAppCode=wdyt'],
  ['s9-system-users', '/system/user'],
];

for (const [name, route] of STOPS) {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log(name, 'goto FAIL', e.message.slice(0, 50)));
  await page.waitForTimeout(3500);
  const nf = await page.locator('text=您访问的页面不存在').count();
  await page.evaluate(SCRUB).catch(() => {});
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`shot: ${name} ${nf ? '(404)' : ''}`);
}

await browser.close();
console.log('done');
