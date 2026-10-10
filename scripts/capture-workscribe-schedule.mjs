// WorkScribe 日程视图补充截图
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const src = readFileSync('scripts/capture-workscribe.mjs', 'utf8');
function extract(name) {
  const start = src.indexOf('const ' + name + ' = `') + name.length + 10;
  const end = src.indexOf('`;', start);
  return src.slice(start, end);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1660, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(extract('MOCK'));
await page.addInitScript(extract('DATA'));
await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.locator('text=日程').first().click().catch(e => console.log('click 日程 FAIL', e.message.slice(0, 80)));
await page.waitForTimeout(1800);
await page.screenshot({ path: 'assets/screenshots/workscribe/08-schedule.png' });
console.log('shot: 08-schedule');
await browser.close();
