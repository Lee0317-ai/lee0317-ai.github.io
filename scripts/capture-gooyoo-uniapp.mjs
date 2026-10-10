// gooyoo 移动端（uniapp H5）演示截图：工作台/审批/我的 三个 tab
import { chromium } from 'playwright';

const BASE = 'http://localhost:9000';
const OUT = 'assets/screenshots/gooyoo';
const ok = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data, msg: '' }) });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 100)));

await page.route('**/admin-api/**', (route) => {
  const u = route.request().url();
  if (u.includes('/auth/login')) return route.fulfill(ok({ accessToken: 'demo', refreshToken: 'demo', userId: 1, expiresTime: 1800000000000 }));
  return route.fulfill(ok({}));
});

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);

await page.screenshot({ path: `${OUT}/10-m-workbench.png` });
console.log('shot: 10-m-workbench');

const clickTab = async (name) => {
  const el = page.locator(`text=${name}`).last();
  await el.click({ timeout: 8000 }).catch(e => console.log(`click ${name} FAIL`, e.message.slice(0, 60)));
  await page.waitForTimeout(2500);
};

await clickTab('审批');
await page.screenshot({ path: `${OUT}/11-m-approval.png` });
console.log('shot: 11-m-approval');

await clickTab('我的');
await page.screenshot({ path: `${OUT}/12-m-mine.png` });
console.log('shot: 12-m-mine');

await browser.close();
console.log('done');
