// gooyoo 门户滚动补拍（图表区）
import { chromium } from 'playwright';

const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.route('**/admin-api/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { list: [], total: 0 }, msg: '' }) }));
await page.addInitScript(`const wrap=${wrap.toString()};localStorage.setItem('ACCESS_TOKEN',wrap('demo'));localStorage.setItem('REFRESH_TOKEN',wrap('demo'));localStorage.setItem('tenantId',wrap(1));`);
await page.goto('http://localhost:8080/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2000);
await page.screenshot({ path: 'assets/screenshots/gooyoo/06-home-charts.png' });
console.log('shot: 06-home-charts');
await browser.close();
