// gooyoo-sync UI 探索（8088，真实系统）
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto('http://localhost:8088/', { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log('goto FAIL', e.message.slice(0, 80)));
await page.waitForTimeout(4000);
console.log('url:', page.url());
const text = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300);
console.log('BODY:', JSON.stringify(text));
const btns = await page.locator('button, a, .menu-item, [role=menuitem]').allInnerTexts().catch(() => []);
console.log('NAV:', btns.map(b => b.trim()).filter(Boolean).slice(0, 30).join(' | '));
await page.screenshot({ path: 'assets/screenshots/_probe/sync-entry.png' });
console.log('probe shot saved');
await browser.close();
