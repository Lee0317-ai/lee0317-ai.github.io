// gooyoo-sync 控制台截图（真实系统；万井然→集成平台、群杰→目标平台、GOOYOO SYNC→集成平台 SYNC）
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
    if (v.includes('群杰')) v = v.replaceAll('群杰', '目标平台');
    if (v.includes('GOOYOO SYNC')) v = v.replaceAll('GOOYOO SYNC', '集成平台 SYNC');
    t.nodeValue = v;
  }
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
await page.waitForTimeout(4000);
await page.evaluate(SCRUB);
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/01-workbench.png` });
console.log('shot: 01-workbench');

const NAVS = [['同步任务', '02-tasks'], ['执行记录', '03-executions'], ['连接与规则', '04-connections']];
for (const [nav, name] of NAVS) {
  await page.locator(`text=${nav}`).first().click({ timeout: 8000 }).catch(e => console.log(`nav ${nav} FAIL`, e.message.slice(0, 50)));
  await page.waitForTimeout(3000);
  await page.evaluate(SCRUB);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot:', name);
}

await browser.close();
console.log('done');
