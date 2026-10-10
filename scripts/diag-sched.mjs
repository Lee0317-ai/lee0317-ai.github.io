import { chromium } from 'playwright';
import { readFileSync } from 'fs';
const src = readFileSync('scripts/capture-workscribe.mjs', 'utf8');
function extract(name) {
  const start = src.indexOf('const ' + name + ' = `') + name.length + 9;
  return src.slice(start, src.indexOf('`;', start));
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error' || m.text().includes('日程')) console.log('CONSOLE:', m.text().slice(0, 300)); });
page.on('pageerror', e => console.log('PAGEERROR:', String(e).slice(0, 300)));
await page.addInitScript(extract('MOCK'));
await page.addInitScript(extract('DATA'));
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(2500);
const hasInternals = await page.evaluate(() => !!window.__TAURI_INTERNALS__);
console.log('internals before click:', hasInternals);
await page.locator('text=日程').first().click();
await page.waitForTimeout(1500);
console.log('internals after click:', await page.evaluate(() => !!window.__TAURI_INTERNALS__));
await browser.close();
