// rhein 拍卖明细页（竞拍详情）截图：缓存注入 + mock 明细/出价记录
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8081';
const BASE = `http://localhost:${PORT}`;
const OUT = 'assets/screenshots/auction';
const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
const SCRUB = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const t of nodes) {
    if (t.nodeValue.includes('建发')) t.nodeValue = t.nodeValue.replaceAll('建发房地产集团有限公司', '莱茵置地集团').replaceAll('建发', '莱茵置地');
  }
  document.querySelectorAll('img').forEach((img) => {
    const s = (img.currentSrc || img.src || '').toLowerCase();
    if (img.closest('.el-header, header, [class*=header], [class*=logo]')) img.style.visibility = 'hidden';
  });
};

const MENUS = [
  { id: 100, parentId: 0, name: '拍卖业务', path: '/auction', component: null, componentName: null, icon: 'fa:gavel', visible: true, keepAlive: true, alwaysShow: true, children: [
    { id: 1001, parentId: 100, name: '专场管理', path: 'hall', component: 'auction/hall/index', componentName: null, icon: 'ep:collection', visible: true, keepAlive: true, alwaysShow: false, children: [] },
    { id: 1002, parentId: 100, name: '拍品管理', path: 'item', component: 'auction/item/index', componentName: null, icon: 'ep:goods', visible: true, keepAlive: true, alwaysShow: false, children: [] },
  ] },
];

const LOT_DETAIL = {
  id: 1, lotNo: 'LOT 0001', title: '青花缠枝莲纹赏瓶', itemName: '青花缠枝莲纹赏瓶', itemNo: 'PM-2026-001',
  itemCategory: '瓷器', itemQuantity: 1, itemMarketPrice: 200000, itemTotalAmount: 156000,
  startingPrice: 80000, bidIncrement: 2000, currentPrice: 156000, currentBidderName: '竞买人 08',
  startTime: 1759990000000, endTime: 1760070000000, bidCount: 24, delayCount: 3,
  itemDescription: '清雍正官窑青花缠枝莲纹赏瓶，全品相，附权威证书。', status: 1, auctionRound: 1,
  imageUrls: [],
};
const BIDS = { list: [
  { id: 'b24', bidNo: 'B-2026-0024', bidderName: '竞买人 08', bidPrice: 156000, price: 156000, bidAmount: 156000, amount: 156000, bidTime: 1760068800000, isHighest: true },
  { id: 'b23', bidNo: 'B-2026-0023', bidderName: '竞买人 15', bidPrice: 154000, price: 154000, bidAmount: 154000, amount: 154000, bidTime: 1760068700000, isHighest: false },
  { id: 'b22', bidNo: 'B-2026-0022', bidderName: '竞买人 08', bidPrice: 152000, price: 152000, bidAmount: 152000, amount: 152000, bidTime: 1760068600000, isHighest: false },
  { id: 'b21', bidNo: 'B-2026-0021', bidderName: '竞买人 21', bidPrice: 150000, price: 150000, bidAmount: 150000, amount: 150000, bidTime: 1760068500000, isHighest: false },
  { id: 'b20', bidNo: 'B-2026-0020', bidderName: '竞买人 15', bidPrice: 148000, price: 148000, bidAmount: 148000, amount: 148000, bidTime: 1760068400000, isHighest: false },
  { id: 'b19', bidNo: 'B-2026-0019', bidderName: '竞买人 08', bidPrice: 146000, price: 146000, bidAmount: 146000, amount: 146000, bidTime: 1760068300000, isHighest: false },
  { id: 'b18', bidNo: 'B-2026-0018', bidderName: '竞买人 15', bidPrice: 144000, price: 144000, bidAmount: 144000, amount: 144000, bidTime: 1760068200000, isHighest: false },
] };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 90)));

await page.route('**/admin-api/**', (route) => {
  const u = route.request().url();
  if (u.includes('/auction/hall/detail')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: LOT_DETAIL, msg: '' }) });
  if (u.includes('/auction/bid/list')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: BIDS.list, msg: '' }) });
  if (u.includes('/system/auth/get-permission-info')) {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { user: { id: 1, nickname: '李工', avatar: '' }, roles: ['super_admin'], permissions: ['*:*:*'], menus: MENUS }, msg: '' }) });
  }
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { list: [], total: 0 }, msg: '' }) });
});
await page.addInitScript(({ menus }) => {
  const w = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', w('demo-access-token'));
  localStorage.setItem('REFRESH_TOKEN', w('demo-refresh-token'));
  localStorage.setItem('tenantId', w(1));
  localStorage.setItem('roleRouters', w(menus));
}, { menus: MENUS });

await page.goto(`${BASE}/auction/hall/detail/1`, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto FAIL', e.message.slice(0, 60)));
await page.waitForTimeout(30000);
await page.evaluate(SCRUB).catch(() => {});
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/05-lot-detail.png` });
console.log('shot: 05-lot-detail url=' + page.url());
await browser.close();
