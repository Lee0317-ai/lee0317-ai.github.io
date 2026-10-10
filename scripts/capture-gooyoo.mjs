// gooyoo 企业平台管理端演示截图（v3：注入路由缓存绕过登录 UI + 路由拦截 mock /admin-api，全部为示例数据）
// 真实登录版在此网络不可达（后端依赖办公内网 DB），后续可在办公网络重写采集
import { chromium } from 'playwright';

const PORT = process.argv[2] || '8080';
const BASE = `http://localhost:${PORT}`;
const OUT = 'assets/screenshots/gooyoo';

// ---- 菜单树（对齐 routerHelper.generateRoute 的 AppCustomRouteRecordRaw）----
const M = (id, name, path, icon, children = []) => ({
  id, parentId: 0, name, path, component: null, componentName: null,
  icon, visible: true, keepAlive: true, alwaysShow: true, children,
});
const MI = (id, parentId, name, path, component, icon) => ({
  id, parentId, name, path, component, componentName: null, icon,
  visible: true, keepAlive: true, alwaysShow: false, children: [],
});
const MENUS = [
  M(100, '系统管理', '/system', 'ep:setting', [
    MI(1001, 100, '用户管理', 'user', 'system/user/index', 'ep:avatar'),
    MI(1002, 100, '角色管理', 'role', 'system/role/index', 'ep:key'),
  ]),
  M(300, 'CRM 客户管理', '/crm', 'ep:user', [
    MI(3001, 300, '客户管理', 'customer', 'crm/customer/index', 'ep:user'),
  ]),
  M(400, '招投标管理', '/bidding', 'ep:collection', [
    MI(4001, 400, '投标看板', 'dashboard', 'bidding/dashboard/index', 'ep:board'),
  ]),
  M(500, '工作流程', '/bpm', 'fa:sitemap', [MI(5001, 500, '流程模型', 'model', 'bpm/model/index', 'fa:sitemap')]),
  M(600, 'ERP', '/erp', 'ep:box', [MI(6001, 600, '产品管理', 'product', 'erp/product/product/index', 'ep:goods')]),
  M(700, '证书管理', '/certificate', 'ep:medal', [MI(7001, 700, '证书台账', 'list', 'certificate/index', 'ep:medal')]),
  M(800, '巡检管理', '/inspection', 'ep:checked', [MI(8001, 800, '巡检任务', 'task', 'inspection/index', 'ep:checked')]),
  M(900, 'IoT 物联网', '/iot', 'ep:cpu', [MI(9001, 900, '设备管理', 'device', 'iot/index', 'ep:cpu')]),
  M(1000, '商城系统', '/mall', 'ep:shopping-cart', [MI(10001, 1000, '商品管理', 'spu', 'mall/product/spu/index', 'ep:goods')]),
  M(1100, '会员中心', '/member', 'ep:user-solid', [MI(11001, 1100, '会员管理', 'user', 'member/user/index', 'ep:user-solid')]),
  M(1200, '支付系统', '/pay', 'ep:money', [MI(12001, 1200, '支付订单', 'order', 'pay/order/index', 'ep:money')]),
  M(1300, '项目管家', '/project', 'ep:folder', [MI(13001, 1300, '项目管理', 'list', 'project/index', 'ep:folder')]),
  M(1400, '报表中心', '/report', 'ep:data-analysis', [MI(14001, 1400, '报表设计', 'report', 'report/index', 'ep:data-analysis')]),
  M(1500, '文档解析', '/docparse', 'ep:document-copy', [MI(15001, 1500, '解析任务', 'task', 'docparse/index', 'ep:document-copy')]),
  M(1600, 'AI 大模型', '/ai', 'ep:magic-stick', [MI(16001, 1600, '对话管理', 'chat', 'ai/chat/index', 'ep:magic-stick')]),
];

// ---- 示例数据 ----
const USERS = { list: [
  { id: 1, username: 'admin', nickname: '李工', mobile: '138****0001', status: 0, deptName: '研发部', createTime: 1759100000000 },
  { id: 2, username: 'zhangwei', nickname: '张伟', mobile: '138****0002', status: 0, deptName: '研发部', createTime: 1759000000000 },
  { id: 3, username: 'liuna', nickname: '李娜', mobile: '138****0003', status: 0, deptName: '交付部', createTime: 1758900000000 },
  { id: 4, username: 'wangfang', nickname: '王芳', mobile: '138****0004', status: 0, deptName: '商务部', createTime: 1758800000000 },
  { id: 5, username: 'liuyang', nickname: '刘洋', mobile: '138****0005', status: 1, deptName: '运维部', createTime: 1758700000000 },
  { id: 6, username: 'chenjing', nickname: '陈静', mobile: '138****0006', status: 0, deptName: '商务部', createTime: 1758600000000 },
], total: 56 };
const ROLES = { list: [
  { id: 1, name: '超级管理员', code: 'super_admin', sort: 1, status: 0, createTime: 1759000000000 },
  { id: 2, name: '项目管理员', code: 'pm', sort: 2, status: 0, createTime: 1758900000000 },
  { id: 3, name: '商务专员', code: 'sales', sort: 3, status: 0, createTime: 1758800000000 },
], total: 3 };
const CUSTOMERS = { list: [
  { id: 1, name: '睿狸建设集团', mobile: '139****1001', ownerUserName: '李工', dealStatus: true, createTime: 1759000000000 },
  { id: 2, name: '智水置业', mobile: '139****1002', ownerUserName: '张伟', dealStatus: true, createTime: 1758900000000 },
  { id: 3, name: '恒信监理咨询', mobile: '139****1003', ownerUserName: '李娜', dealStatus: false, createTime: 1758800000000 },
  { id: 4, name: '宏远建材', mobile: '139****1004', ownerUserName: '王芳', dealStatus: false, createTime: 1758700000000 },
  { id: 5, name: '晟安机电', mobile: '139****1005', ownerUserName: '李工', dealStatus: true, createTime: 1758600000000 },
], total: 18 };

const ok = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data, msg: '' }) });
const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const warn = [];
page.on('console', (m) => { const t = m.text(); if (t.includes('未找到菜单组件')) warn.push(t.slice(0, 90)); });

await page.route('**/admin-api/**', (route) => {
  const u = route.request().url();
  if (u.includes('/system/user/page')) return route.fulfill(ok(USERS));
  if (u.includes('/system/role/page')) return route.fulfill(ok(ROLES));
  if (u.includes('/crm/customer/page')) return route.fulfill(ok(CUSTOMERS));
  if (u.includes('/system/dict-data/simple-list')) return route.fulfill(ok([]));
  if (u.includes('/system/auth/get-permission-info')) {
    return route.fulfill(ok({ user: { id: 1, nickname: '李工', avatar: '' }, roles: ['super_admin'], permissions: ['*:*:*'], menus: MENUS }));
  }
  if (u.includes('/system/auth/logout')) return route.fulfill(ok(true));
  return route.fulfill(ok({ list: [], total: 0 }));
});

// 注入令牌与路由缓存（绕过登录 UI 的验证码崩溃）
await page.addInitScript(({ menus, wrapSrc }) => {
  const wrap = (v) => JSON.stringify({ c: Date.now(), e: Date.now() + 365 * 86400 * 1000, v: JSON.stringify(v) });
  localStorage.setItem('ACCESS_TOKEN', wrap('demo-access-token'));
  localStorage.setItem('REFRESH_TOKEN', wrap('demo-refresh-token'));
  localStorage.setItem('tenantId', wrap(1));
  localStorage.setItem('roleRouters', wrap(menus));
}, { menus: MENUS, wrapSrc: wrap.toString() });

// 1. 首页工作台
await page.goto(BASE + '/index', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);
console.log('url:', page.url());
await page.screenshot({ path: `${OUT}/02-home.png` });
console.log('shot: 02-home');

// 2. 系统管理 → 用户管理
await page.goto(BASE + '/system/user', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/03-users.png` });
console.log('shot: 03-users');

// 3. CRM → 客户管理
await page.goto(BASE + '/crm/customer', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/04-crm.png` });
console.log('shot: 04-crm');

await browser.close();
warn.length && console.log('菜单组件未命中:', [...new Set(warn)].slice(0, 6));
console.log('done');
