// WorkScribe 演示数据截图采集（浏览器 mock Tauri 数据层，内容为明显示例数据）
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const OUT = 'assets/screenshots/workscribe';

// ---------- mock 数据层 ----------
const MOCK = `
window.__TAURI_INTERNALS__ = {
  metadata: { currentWindow: { label: 'main' }, currentWebview: { label: 'main' } },
  _cbId: 1,
  transformCallback(cb) { return this._cbId++; },
  convertFileSrc(p) { return 'http://asset.localhost/' + encodeURIComponent(String(p)); },
  invoke(cmd, args) {
    const D = window.__DEMO_DATA__;
    const M = {
      app_edition: () => 'personal',
      get_categories: () => ['研发', '会议', '文档', '运维'],
      list_records: () => D.records,
      list_active_grouped_cmd: () => D.grouped,
      list_week_cmd: () => D.weekTodos,
      list_pending_items_cmd: () => [],
      list_record_sessions: () => D.sessions,
      list_recurrence_templates_cmd: () => [],
      list_dictionary_items: () => [],
      list_llm_configs: () => D.llmConfigs,
      analyze_record_input: () => D.agentResult,
      refine_record_items: () => D.agentResult,
      save_record_session: () => 42,
      create_record: () => 101,
      preview_report: () => D.reportHtml,
      generate_report: () => 'C:\\\\demo\\\\report.html',
      check_report_quality_cmd: () => ({ can_generate: true, issues: [] }),
      preview_weekly_task_summary: () => D.weeklySummary,
      list_report_templates: () => [],
      get_default_report_template: () => null,
      parse_todo_text: (a) => ({ title: a.text, reminder_at: null, due_at: null, category: null, tags: null }),
      global_search_cmd: () => [],
      feishu_status: () => ({ has_app_creds: false, bound: false, bound_name: null, calendar_id: null, sync_enabled: false }),
      crm_status: () => ({ configured: false, bound: false, enabled: false, base_url: null, owner_user_id: null, sync_category: 'work' }),
      get_github_settings: () => null,
      get_db_info: () => ({ path: 'C:\\\\demo\\\\worklog.db', bytes: 1048576, wal_exists: false, schema_version: 12 }),
      complete_todo_cmd: (a) => a.id,
      set_todo_state_cmd: () => {},
    };
    if (cmd in M) return Promise.resolve(M[cmd](args));
    if (cmd.startsWith('plugin:event|')) return Promise.resolve(window.__TAURI_INTERNALS__._cbId++);
    if (cmd.startsWith('list_')) return Promise.resolve([]);
    console.log('[mock] UNHANDLED:', cmd, JSON.stringify(args || {}).slice(0, 100));
    return Promise.resolve(null);
  },
};
`;

const DATA = `
window.__DEMO_DATA__ = {
  records: [
    { id: 1, content: '参加监理对接会，确认二期消防验收计划与资料清单', raw_text: '上午和监理开对接会…', screenshot_paths: '[]', category: '会议', tags: '消防验收,对接会', people: '张工', duration_minutes: 60, result: null, record_date: '2026-10-10', created_at: '2026-10-10 09:40:00', updated_at: '2026-10-10 09:40:00', status: 'active', expanded_content: null },
    { id: 2, content: '修复报表导出在中文文件名下的编码问题', raw_text: '修了个导出bug…', screenshot_paths: '[]', category: '研发', tags: '报表,bugfix', people: '', duration_minutes: 90, result: null, record_date: '2026-10-10', created_at: '2026-10-10 14:20:00', updated_at: '2026-10-10 14:20:00', status: 'active', expanded_content: null },
    { id: 3, content: '整理并发送新版用户手册给客户', raw_text: '手册发给客户了', screenshot_paths: '[]', category: '文档', tags: '用户手册', people: '李经理', duration_minutes: 45, result: null, record_date: '2026-10-09', created_at: '2026-10-09 17:10:00', updated_at: '2026-10-09 17:10:00', status: 'active', expanded_content: null },
  ],
  grouped: {
    overdue: [],
    today: [
      { id: 11, title: '提交二期消防验收资料清单', notes: '', state: 'todo', priority: 1, category: '研发', scope: 'work', tags: '', due_at: '2026-10-10 18:00', reminder_at: null, parent_id: null, depends_on: '', sort_order: 0, linked_record_id: null, source_record_id: null, created_at: '2026-10-10 09:45:00', updated_at: '2026-10-10 09:45:00', completed_at: null },
      { id: 12, title: 'review 新版报表导出代码', notes: '', state: 'doing', priority: 2, category: '研发', scope: 'work', tags: '', due_at: null, reminder_at: null, parent_id: null, depends_on: '', sort_order: 1, linked_record_id: null, source_record_id: null, created_at: '2026-10-10 08:30:00', updated_at: '2026-10-10 08:30:00', completed_at: null },
    ],
    upcoming: [
      { id: 13, title: '准备季度复盘材料', notes: '先列提纲', state: 'todo', priority: 2, category: '会议', scope: 'work', tags: '', due_at: '2026-10-14', reminder_at: null, parent_id: null, depends_on: '', sort_order: 2, linked_record_id: null, source_record_id: null, created_at: '2026-10-09 18:00:00', updated_at: '2026-10-09 18:00:00', completed_at: null },
    ],
    no_due: [],
  },
  weekTodos: [
    { id: 11, title: '提交二期消防验收资料清单', notes: '', state: 'todo', priority: 1, category: '研发', scope: 'work', tags: '', due_at: '2026-10-10 18:00', reminder_at: null, parent_id: null, depends_on: '', sort_order: 0, linked_record_id: null, source_record_id: null, created_at: '2026-10-10 09:45:00', updated_at: '2026-10-10 09:45:00', completed_at: null },
    { id: 12, title: 'review 新版报表导出代码', notes: '', state: 'doing', priority: 2, category: '研发', scope: 'work', tags: '', due_at: '2026-10-10', reminder_at: null, parent_id: null, depends_on: '', sort_order: 1, linked_record_id: null, source_record_id: null, created_at: '2026-10-10 08:30:00', updated_at: '2026-10-10 08:30:00', completed_at: null },
    { id: 13, title: '准备季度复盘材料', notes: '先列提纲', state: 'todo', priority: 2, category: '会议', scope: 'work', tags: '', due_at: '2026-10-14', reminder_at: null, parent_id: null, depends_on: '', sort_order: 2, linked_record_id: null, source_record_id: null, created_at: '2026-10-09 18:00:00', updated_at: '2026-10-09 18:00:00', completed_at: null },
  ],
  sessions: [
    { id: 7, raw_text: '上午和监理开对接会…', created_at: '2026-10-10 09:40:00', todo_count: 2, pending_open_count: 1, pending_resolved_count: 0 },
  ],
  llmConfigs: [],
  agentResult: {
    todos: [
      { title: '提交二期消防验收资料清单', confidence: 0.9, category: '研发', scope: 'work', due_at: '2026-10-10 18:00', notes: '对接会确定的下一步动作' },
      { title: '准备季度复盘材料提纲', confidence: 0.85, category: '会议', scope: 'work', due_at: '2026-10-14', notes: '下周三前完成' },
    ],
    done: [
      { title: '参加监理对接会，确认消防验收计划', confidence: 0.95, category: '会议', scope: 'work', notes: null },
      { title: '修复报表导出中文文件名编码问题', confidence: 0.95, category: '研发', scope: 'work', notes: null },
      { title: '发送新版用户手册给客户', confidence: 0.9, category: '文档', scope: 'work', notes: null },
    ],
    pending: [
      { title: '复盘材料是否沿用上季度模板', confidence: 0.4, notes: '需要和领导确认', reason: '信息不足' },
    ],
  },
  weeklySummary: {
    done_items: [
      { title: '完成二期合同比对模块联调', due_at: null, completed_at: '2026-10-08', category: '研发' },
      { title: '输出周报功能灰度方案', due_at: null, completed_at: '2026-10-09', category: '研发' },
    ],
    follow_up: { overdue_items: [], scheduled_items: [{ title: '准备季度复盘材料', due_at: '2026-10-14', category: '会议' }], unscheduled_items: [] },
  },
  reportHtml: '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><style>body{font-family:"Microsoft YaHei",sans-serif;max-width:760px;margin:32px auto;color:#1c1917;line-height:1.7}h1{font-size:22px;border-bottom:2px solid #0f766e;padding-bottom:8px}h2{font-size:16px;color:#0f766e;margin:22px 0 8px}li{margin:4px 0}.meta{color:#78716c;font-size:13px}</style></head><body><h1>工作周报（2026-10-05 ~ 2026-10-10）</h1><p class="meta">由 WorkScribe 自动生成 · 共 12 条工作记录 · 5 项任务更新</p><h2>本周已完成</h2><ul><li>完成二期合同比对模块联调，OCR 对齐准确率验收通过</li><li>修复报表导出中文文件名编码问题</li><li>参加监理对接会，确认二期消防验收计划与资料清单</li><li>整理并发送新版用户手册给客户</li></ul><h2>进行中</h2><ul><li>review 新版报表导出代码</li><li>提交二期消防验收资料清单</li></ul><h2>下周计划</h2><ul><li>准备季度复盘材料（10-14 前）</li><li>启动飞书日历双向同步灰度</li></ul></body></html>',
};
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(MOCK);
await page.addInitScript(DATA);
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 110)));

const dump = async (tag) => {
  const btns = await page.locator('button:visible').allInnerTexts();
  const inputs = await page.locator('textarea:visible, input:visible').count();
  console.log(`[${tag}] buttons=`, btns.map(b => b.trim()).filter(Boolean).slice(0, 18).join('|'), ` inputs=${inputs}`);
};

// 1. 今日工作台
await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/01-dashboard.png` });
await dump('dashboard');

// 2. 快速记录
await page.locator('text=快速记录').first().click().catch(e => console.log('click 快速记录 FAIL', e.message.slice(0, 60)));
await page.waitForTimeout(1200);
await dump('quick-input');

// 2.1 输入演示文本
const ta = page.locator('textarea:visible').first();
await ta.fill('今天上午和监理开了对接会，确认了二期消防验收计划和资料清单；下午修复了报表导出在中文文件名下的编码问题；把新版用户手册发给客户了；下周三前要准备季度复盘材料，还没想好框架');
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/02-quick-input.png` });
console.log('shot: 02-quick-input');

// 2.2 AI 拆解
await page.locator('button:has-text("AI 拆解")').first().click().catch(e => console.log('AI拆解 FAIL', e.message.slice(0, 60)));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/03-ai-result.png` });
console.log('shot: 03-ai-result');
await dump('after-ai');

// 2.3 保存（滚到底部找按钮）
await page.mouse.wheel(0, 4000);
await page.waitForTimeout(600);
{ const all = await page.locator('button').allInnerTexts(); console.log('AFTER-AI BUTTONS:', all.map(b=>b.trim().replace(/\n/g,' ')).filter(Boolean).join(' | ')); }
for (const name of ['确认保存', '保存记录', '保存并进入工作汇报', '保存', '确认', '完成']) {
  const b = page.locator(`button:has-text("${name}")`).first();
  if (await b.count() && await b.isVisible().catch(() => false)) {
    await b.click();
    await page.waitForTimeout(1200);
    console.log('clicked save button:', name);
    break;
  }
}
await page.screenshot({ path: `${OUT}/04-saved.png` });
console.log('shot: 04-saved');

// 3. 待办任务
await page.locator('text=待办任务').first().click().catch(e => console.log('click 待办 FAIL', e.message.slice(0, 60)));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/05-todos.png` });
console.log('shot: 05-todos');
await dump('todos');

// 4. 生成报告
await page.locator('text=生成报告').first().click().catch(e => console.log('click 生成报告 FAIL', e.message.slice(0, 60)));
await page.waitForTimeout(1500);
await dump('report-form');
await page.screenshot({ path: `${OUT}/06-report-form.png` });
console.log('shot: 06-report-form');
for (const name of ['生成预览', '预览报告', '预 览', '预览', '生成报告']) {
  const b = page.locator(`button:has-text("${name}")`).first();
  if (await b.count() && await b.isVisible().catch(() => false)) {
    await b.click();
    await page.waitForTimeout(2000);
    console.log('clicked preview button:', name);
    break;
  }
}
await page.screenshot({ path: `${OUT}/07-report-preview.png` });
console.log('shot: 07-report-preview');

await browser.close();
console.log('ALL DONE');
