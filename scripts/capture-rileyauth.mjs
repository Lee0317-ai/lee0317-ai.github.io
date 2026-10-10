// riley-auth 管理后台演示截图（Playwright 路由拦截 mock REST API，示例数据）
import { chromium } from 'playwright';

const BASE = 'http://localhost:5273';
const OUT = 'assets/screenshots/rileyauth';

const dep = (id, parentId, name, code, sortOrder, userCount, childCount) => ({
  id, parentId: parentId ?? null, name, code, sortOrder, status: 'active', userCount, childCount,
});
const user = (id, username, displayName, roles, dept, lastLogin) => ({
  id, username, displayName, email: `${username}@example.com`, status: 'active',
  departmentId: dept, lastLoginAt: lastLogin, roles,
});

const DATA = {
  users: {
    items: [
      user('u1', 'admin', '系统管理员', [{ code: 'super_admin', name: '超级管理员' }], 'd1', '2026-10-10 08:30'),
      user('u2', 'zhang.san', '张三', [{ code: 'admin', name: '管理员' }], 'd2', '2026-10-10 09:12'),
      user('u3', 'li.si', '李四', [{ code: 'auditor', name: '审计员' }], 'd4', '2026-10-09 18:44'),
      user('u4', 'wang.wu', '王五', [{ code: 'app_user', name: '应用用户' }], 'd2', '2026-10-09 14:03'),
      user('u5', 'zhao.liu', '赵六', [{ code: 'app_user', name: '应用用户' }], 'd3', '2026-10-08 16:27'),
      user('u6', 'sun.qi', '孙七', [{ code: 'admin', name: '管理员' }], 'd4', '2026-10-07 10:55'),
    ],
    total: 42,
  },
  roles: {
    items: [
      { id: 'r1', code: 'super_admin', name: '超级管理员', description: '全部权限，不可删除', permissions: ['user:write', 'user:read', 'role:write', 'role:read', 'app:write', 'app:read', 'audit:read'], isSystem: true, status: 'active', userCount: 1, applications: [{ id: 'a1', code: 'admin-console', name: '管理后台' }] },
      { id: 'r2', code: 'admin', name: '管理员', description: '账号与权限日常管理', permissions: ['user:write', 'user:read', 'role:read', 'app:read', 'audit:read'], isSystem: false, status: 'active', userCount: 2, applications: [{ id: 'a1', code: 'admin-console', name: '管理后台' }] },
      { id: 'r3', code: 'auditor', name: '审计员', description: '只读审计日志', permissions: ['audit:read', 'user:read'], isSystem: false, status: 'active', userCount: 1, applications: [{ id: 'a1', code: 'admin-console', name: '管理后台' }] },
      { id: 'r4', code: 'app_user', name: '应用用户', description: '登录接入应用的普通用户', permissions: [], isSystem: false, status: 'active', userCount: 39, applications: [{ id: 'a2', code: 'agent-os', name: 'WOS 桌面 Agent' }, { id: 'a3', code: 'ai-agent', name: '调查型 AI Agent' }] },
    ],
    allPermissions: ['user:read', 'user:write', 'role:read', 'role:write', 'app:read', 'app:write', 'audit:read', 'team:read', 'team:write', 'dept:read', 'dept:write'],
  },
  applications: {
    items: [
      { id: 'a1', code: 'admin-console', name: '管理后台', description: '账号中心自带管理端', status: 'active', roleCount: 4 },
      { id: 'a2', code: 'agent-os', name: 'WOS 桌面 Agent', description: '桌面 Agent 工作台接入', status: 'active', roleCount: 2 },
      { id: 'a3', code: 'ai-agent', name: '调查型 AI Agent', description: '研发团队调查助手接入', status: 'active', roleCount: 2 },
    ],
  },
  departments: {
    items: [
      dep('d1', null, '睿狸科技', 'root', 0, 0, 3),
      dep('d2', 'd1', '研发部', 'rd', 1, 24, 0),
      dep('d3', 'd1', '交付部', 'delivery', 2, 11, 0),
      dep('d4', 'd1', '职能与合规', 'ops', 3, 7, 0),
    ],
  },
  teams: {
    items: [
      { id: 't1', name: '平台研发组', description: '账号中心与底座服务', status: 'active', memberCount: 8 },
      { id: 't2', name: 'Agent 应用组', description: 'WOS 与调查 Agent', status: 'active', memberCount: 6 },
      { id: 't3', name: '交付实施组', description: '客户现场交付', status: 'active', memberCount: 5 },
    ],
  },
  auditLogs: {
    items: [
      { id: 'l1', createdAt: '2026-10-10T09:12:33+08:00', operatorId: 'u2', action: 'user.login', targetType: 'user', targetId: 'u2' },
      { id: 'l2', createdAt: '2026-10-10T09:05:10+08:00', operatorId: 'u1', action: 'role.update', targetType: 'role', targetId: 'r4' },
      { id: 'l3', createdAt: '2026-10-10T08:30:02+08:00', operatorId: 'u1', action: 'user.login', targetType: 'user', targetId: 'u1' },
      { id: 'l4', createdAt: '2026-10-09T18:44:51+08:00', operatorId: 'u3', action: 'audit.export', targetType: 'audit', targetId: null },
      { id: 'l5', createdAt: '2026-10-09T15:20:08+08:00', operatorId: 'u1', action: 'user.create', targetType: 'user', targetId: 'u6' },
      { id: 'l6', createdAt: '2026-10-09T11:02:40+08:00', operatorId: 'u2', action: 'app.register', targetType: 'application', targetId: 'a3' },
      { id: 'l7', createdAt: '2026-10-08T17:36:19+08:00', operatorId: 'u1', action: 'department.create', targetType: 'department', targetId: 'd4' },
      { id: 'l8', createdAt: '2026-10-08T10:15:55+08:00', operatorId: 'u2', action: 'user.reset_password', targetType: 'user', targetId: 'u5' },
    ],
    total: 1287,
  },
};

const TOKENS = { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token', expiresAt: '2027-12-31T00:00:00.000Z' };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 110)));

// 拦截 API 请求
await page.route('**/admin/**', (route) => {
  const url = route.request().url();
  const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  if (url.includes('/admin/users?')) return json(DATA.users);
  if (url.includes('/admin/roles')) return json(DATA.roles);
  if (url.includes('/admin/applications')) return json(DATA.applications);
  if (url.includes('/admin/departments')) return json(DATA.departments);
  if (url.includes('/admin/teams')) return json(DATA.teams);
  if (url.includes('/admin/audit-logs?')) return json(DATA.auditLogs);
  return json({ items: [] });
});
await page.route('**/auth/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TOKENS) }));

// 1. 登录页（未注入令牌）
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/01-login.png` });
console.log('shot: 01-login');

// 2. 注入令牌 → 账号管理
await page.evaluate((t) => localStorage.setItem('riley-admin-tokens', JSON.stringify(t)), TOKENS);
const STOPS = [
  { hash: '#/accounts', png: '02-accounts', wait: 1600 },
  { hash: '#/departments', png: '03-departments', wait: 1200 },
  { hash: '#/roles', png: '04-roles', wait: 1200 },
  { hash: '#/apps', png: '05-apps', wait: 1200 },
  { hash: '#/teams', png: '06-teams', wait: 1200 },
  { hash: '#/audit', png: '07-audit', wait: 1400 },
];
for (const s of STOPS) {
  await page.goto(`${BASE}/${s.hash}`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.reload({ waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(s.wait);
  await page.screenshot({ path: `${OUT}/${s.png}.png` });
  console.log('shot:', s.png);
}
await browser.close();
errs.length && console.log('PAGE ERRORS:', [...new Set(errs)]);
console.log('done');
