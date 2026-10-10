import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const shots = [
  { url: 'https://shiguang.app', out: 'assets/screenshots/timepick/home.png' },
];
await mkdir('assets/screenshots/timepick', { recursive: true });
const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(s.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({ path: s.out });
    console.log('OK ', s.out);
  } catch (e) {
    console.error('FAIL', s.url, e.message);
  }
  await page.close();
}
await browser.close();
