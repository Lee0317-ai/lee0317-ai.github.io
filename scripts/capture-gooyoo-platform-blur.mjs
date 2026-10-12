// 系统管理中心重拍：部门人数分布卡片模糊遮罩（canvas 真实部门名不可 DOM 替换）
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

await page.goto('http://localhost:8080/portal/system-home?portalAppCode=platform', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);

// 展开菜单
for (let pass = 0; pass < 2; pass++) {
  const titles = page.locator('.el-sub-menu__title');
  const n = await titles.count();
  for (let i = 0; i < n; i++) await titles.nth(i).click({ timeout: 1200 }).catch(() => {});
  await page.waitForTimeout(300);
}

// 模糊「部门人数分布」卡片
await page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode;
    if (t.nodeValue.includes('部门人数分布')) {
      let el = t.parentElement;
      for (let i = 0; i < 8 && el; i++) {
        if (el.getBoundingClientRect().height > 200) { el.style.filter = 'blur(10px)'; break; }
        el = el.parentElement;
      }
      break;
    }
  }
});
await page.waitForTimeout(500);
// 脱敏文本
await page.evaluate(() => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (t.nodeValue.includes('万井然')) t.nodeValue = t.nodeValue.replaceAll('万井然', '集成平台');
  }
});
await page.screenshot({ path: 'assets/screenshots/gooyoo/sys-platform.png' });
console.log('shot: sys-platform.png (部门分布已模糊)');
await browser.close();
