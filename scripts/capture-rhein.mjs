// rhein 拍卖系统管理端演示截图 v2（品牌脱敏：建发→莱茵置地；缓存注入 + 路由拦截，示例数据）
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8081';
const BASE = `http://localhost:${PORT}`;
const OUT = 'assets/screenshots/auction';

const M = (id, name, path, icon, children = []) => ({
  id, parentId: 0, name, path, component: null, componentName: null,
  icon, visible: true, keepAlive: true, alwaysShow: true, children,
});
const MI = (id, parentId, name, path, component, icon) => ({
  id, parentId, name, path, component, componentName: null, icon,
  visible: true, keepAlive: true, alwaysShow: false, children: [],
});
const MENUS = [
  M(100, '拍卖业务', '/auction', 'fa:gavel', [
    MI(1001, 100, '专场管理', 'hall', 'auction/hall/index', 'ep:collection'),
    MI(1002, 100, '拍品管理', 'item', 'auction/item/index', 'ep:goods'),
    MI(1003, 100, '竞价记录', 'lot', 'auction/lot/index', 'ep:tag'),
    MI(1004, 100, '成交结果', 'result', 'auction/result/index', 'ep:trophy'),
    MI(1005, 100, '提货管理', 'pickup', 'auction/pickup/index', 'ep:box'),
  ]),
  M(200, '工作流程', '/bpm', 'fa:sitemap', [MI(2001, 200, '流程模型', 'model', 'bpm/model/index', 'fa:sitemap')]),
  M(300, '会员中心', '/member', 'ep:user-solid', [MI(4001, 300, '会员管理', 'user', 'member/user/index', 'ep:user-solid')]),
];

const LOTS = { list: [
  { id: 1, lotNo: 'LOT 0001', title: '青花缠枝莲纹赏瓶', itemName: '青花缠枝莲纹赏瓶', startingPrice: 80000, bidIncrement: 2000, currentPrice: 156000, currentBidderName: '竞买人 08', startTime: 1759990000000, endTime: 1760070000000, bidCount: 23, status: 3, displayType: 1 },
  { id: 2, lotNo: 'LOT 0002', title: '和田玉雕山水摆件', itemName: '和田玉雕山水摆件', startingPrice: 30000, bidIncrement: 1000, currentPrice: 72000, currentBidderName: '竞买人 15', startTime: 1759990000000, endTime: 1760072000000, bidCount: 14, status: 3, displayType: 1 },
  { id: 3, lotNo: 'LOT 0003', title: '铜胎掐丝珐琅盖盒', itemName: '铜胎掐丝珐琅盖盒', startingPrice: 50000, bidIncrement: 2000, currentPrice: 98000, currentBidderName: '竞买人 03', startTime: 1760074000000, endTime: 1760150000000, bidCount: 0, status: 2, displayType: 1 },
  { id: 4, lotNo: 'LOT 0004', title: '天然翡翠手镯（内径 58mm）', itemName: '天然翡翠手镯', startingPrice: 120000, bidIncrement: 5000, currentPrice: 0, currentBidderName: '', startTime: 1760160000000, endTime: 1760240000000, bidCount: 0, status: 2, displayType: 1 },
  { id: 5, lotNo: 'LOT 0005', title: '晚清粉彩人物故事罐', itemName: '晚清粉彩人物故事罐', startingPrice: 20000, bidIncrement: 1000, currentPrice: 46000, currentBidderName: '竞买人 21', startTime: 1759900000000, endTime: 1759960000000, bidCount: 31, status: 0, displayType: 1 },
], total: 5 };

const ok = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data, msg: '' }) });
const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });

// 品牌脱敏：真实客户名 → 示例名（呼应 rhein 项目代号）
const SCRUB = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (t.nodeValue.includes('建发')) {
      t.nodeValue = t.nodeValue.replaceAll('建发房地产集团有限公司', '莱茵置地集团').replaceAll('建发', '莱茵置地');
    }
  }
  document.querySelectorAll('img').forEach((img) => {
    const s = (img.currentSrc || img.src || '').toLowerCase();
    if (s.includes('cdb') || s.includes('jianfa') || (img.alt || '').includes('建发') || img.closest('.el-header, header, [class*=header], [class*=logo]')) {
      img.style.visibility = 'hidden';
    }
  });
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 90)));

await page.route('**/admin-api/**', (route) => {
  const u = route.request().url();
  if (u.includes('/auction/hall/page')) return route.fulfill(ok(LOTS));
  if (u.includes('/auction/item/page')) return route.fulfill(ok(LOTS));
  if (u.includes('/auction/hall/server-time')) return route.fulfill(ok(Date.now()));
  if (u.includes('/system/dict-data/simple-list')) return route.fulfill(ok([]));
  if (u.includes('/system/auth/get-permission-info')) {
    return route.fulfill(ok({ user: { id: 1, nickname: '李工', avatar: '' }, roles: ['super_admin'], permissions: ['*:*:*'], menus: MENUS }));
  }
  return route.fulfill(ok({ list: [], total: 0 }));
});
await page.addInitScript(({ menus }) => {
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap('demo-access-token'));
  localStorage.setItem('REFRESH_TOKEN', wrap('demo-refresh-token'));
  localStorage.setItem('tenantId', wrap(1));
  localStorage.setItem('roleRouters', wrap(menus));
}, { menus: MENUS });

const shot = async (name) => {
  await page.evaluate(SCRUB).catch(() => {});
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot:', name);
};

// 登录页
await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForSelector('input[type="password"]', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(4000);
await shot('01-login');

// 拍卖首页（竞拍大厅）
await page.goto(BASE + '/auction/home', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(5000);
await shot('02-hall-home');

// 专场管理列表
await page.goto(BASE + '/auction/hall', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3500);
await shot('03-hall-list');

await browser.close();
console.log('done');
