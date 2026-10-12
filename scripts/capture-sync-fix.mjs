// sync 修补：01 工作台视图 + 04 连接页凭据打码
import { chromium } from 'playwright';

const BASE = 'http://localhost:8088';
const OUT = 'assets/screenshots/gooyoo-sync';
const SCRUB = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    let v = t.nodeValue;
    if (v.includes('万井然')) v = v.replaceAll('万井然', '集成平台');
    if (v.includes('群杰平台')) v = v.replaceAll('群杰平台', '目标平台');
    if (v.includes('群杰')) v = v.replaceAll('群杰', '目标平台');
    if (v.includes('QUNJIE')) v = v.replaceAll('QUNJIE', 'MUBIAO');
    if (v.includes('GOOYOO SYNC')) v = v.replaceAll('GOOYOO SYNC', '集成平台 SYNC');
    if (v.includes('WANJINGRAN')) v = v.replaceAll('WANJINGRAN', 'JICHENG');
    v = v.replace(/http:\/\/\d{1,3}(\.\d{1,3}){3}(:\d+)?/g, 'https://***（已脱敏）');
    v = v.replace(/^[0-9a-f]{24,}$/i, '********************************');
    t.nodeValue = v;
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

// 01 工作台
await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
await page.waitForTimeout(4000);
await page.locator('text=工作台').first().click({ timeout: 5000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.evaluate(SCRUB);
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/01-workbench.png` });
console.log('shot: 01-workbench');

// 04 连接与规则（凭据打码）
await page.locator('text=连接与规则').first().click({ timeout: 8000 }).catch(e => console.log('nav FAIL', e.message.slice(0, 50)));
await page.waitForTimeout(3000);
await page.evaluate(SCRUB);
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/04-connections.png` });
console.log('shot: 04-connections (凭据已打码)');

await browser.close();
console.log('done');
