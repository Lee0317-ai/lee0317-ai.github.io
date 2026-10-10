// workEvidence 演示数据截图采集（浏览器 mock Tauri 数据层，内容为明显示例数据）
import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const OUT = 'assets/screenshots/workevidence';

// ---------- mock 数据层 ----------
const MOCK = `
window.__TAURI_INTERNALS__ = {
  metadata: { currentWindow: { label: 'main' }, currentWebview: { label: 'main' } },
  _callbacks: {},
  _cbId: 1,
  transformCallback(cb, once) { const id = this._cbId++; this._callbacks[id] = { cb, once }; return id; },
  convertFileSrc(path) { return 'http://asset.localhost/' + encodeURIComponent(String(path)); },
  invoke(cmd, args) {
    const D = window.__DEMO_DATA__;
    const M = {
      get_dashboard_stats: () => ({ processing: 1, pending_review: 6, high_risk: 2, completed_this_week: 5 }),
      list_tasks: () => D.tasks,
      get_task: (a) => D.taskDetails[a.taskId] || D.taskDetails['t1'],
      get_task_progress: () => ({ task_id: 't1', status: 'done', stage: '完成', progress: 100 }),
      check_ocr_health: () => ({ ok: true, backend: 'gooyoo', compare_version: '0.4.2', error: null }),
      list_documents: () => D.documents,
      get_task_documents: () => ({ standard_path: '标准合同.docx', standard_type: 'docx', candidate_path: '候选合同.pdf', candidate_type: 'pdf' }),
      list_page_previews: () => [],
      get_page_alignment: () => ({ aligned: true, page_pairs: [1,2,3,4,5,6,7,8].map(n => ({ std_page: n, cand_page: n })), aligned_diff_count: D.diffs.length }),
      list_diffs: (a) => D.diffs.filter(d => !a || a.taskId === 't1' || true),
      list_risk_findings: () => D.risks,
      list_reports: () => D.reports,
      list_rules: () => D.rules,
      get_settings: () => ({ llm_provider: 'openai', llm_model: 'gpt-4o-mini', llm_base_url: '', retention_days: 90, enable_web_check: false, local_llm_url: '', cloud_api_key: '', ocr_service_url: 'http://127.0.0.1:8089', ocr_provider: 'gooyoo', paddleocr_access_token: '' }),
      list_presets: () => [],
      list_templates: () => [],
      list_clause_reviews: () => [],
      list_page_reviews: () => [],
      list_review_records: () => [],
      list_template_versions: () => [],
    };
    if (cmd in M) return Promise.resolve(M[cmd](args));
    if (cmd.startsWith('plugin:event|')) return Promise.resolve(window.__TAURI_INTERNALS__._cbId++);
    if (cmd.startsWith('list_')) return Promise.resolve([]);
    return Promise.resolve(null);
  },
};
`;

const d = (s) => s.trim();
const DATA = `
window.__DEMO_DATA__ = {
  tasks: [
    { id: 't1', name: '智水园区二期施工总承包合同比对', task_type: 'contract_compare', status: 'done', progress: 100, updated_at: '2026-10-09 16:42' },
    { id: 't2', name: '商务楼精装修工程补充协议审查', task_type: 'contract_compare', status: 'done', progress: 100, updated_at: '2026-10-08 11:20' },
    { id: 't3', name: '监理服务合同条款审查', task_type: 'clause_review', status: 'processing', progress: 60, updated_at: '2026-10-10 09:15' },
  ],
  taskDetails: {
    t1: { id: 't1', name: '智水园区二期施工总承包合同比对', task_type: 'contract_compare', status: 'done', engine: 'gooyoo', summary_json: null, document_mode: 'layout' },
  },
  documents: [
    { id: 'd1', task_id: 't1', filename: '施工总承包合同（标准范本）.docx', file_type: 'docx', storage_path: 'C:\\\\demo\\\\standard.docx', page_count: 8 },
    { id: 'd2', task_id: 't1', filename: '智水园区二期承包合同（投标稿）.pdf', file_type: 'pdf', storage_path: 'C:\\\\demo\\\\candidate.pdf', page_count: 8 },
  ],
  diffs: [
    { id: 'f1', task_id: 't1', diff_id: 'd-01', type: 'replace', page_index: 2, risk_level: 'high', risk_category: '付款条款', standard_text: '进度款按月支付，支付比例为当月经审定已完成产值的 80%', candidate_text: '进度款按季度支付，支付比例为当季经审定已完成产值的 60%', standard_bbox: '[]', candidate_bbox: '[]', review_required: true, engine: 'gooyoo', source: 'layout', review_status: 'pending' },
    { id: 'f2', task_id: 't1', diff_id: 'd-02', type: 'insert', page_index: 3, risk_level: 'high', risk_category: '违约责任', standard_text: '', candidate_text: '承包人逾期竣工的，逾期违约金上限为合同价款的 10%', standard_bbox: '[]', candidate_bbox: '[]', review_required: true, engine: 'gooyoo', source: 'layout', review_status: 'pending' },
    { id: 'f3', task_id: 't1', diff_id: 'd-03', type: 'replace', page_index: 3, risk_level: 'medium', risk_category: '工期条款', standard_text: '计划开工日期：2026 年 11 月 1 日，总工期 540 日历天', candidate_text: '计划开工日期：2027 年 3 月 1 日，总工期 480 日历天', standard_bbox: '[]', candidate_bbox: '[]', review_required: true, engine: 'gooyoo', source: 'layout', review_status: 'pending' },
    { id: 'f4', task_id: 't1', diff_id: 'd-04', type: 'delete', page_index: 5, risk_level: 'high', risk_category: '质保条款', standard_text: '防水工程保修期不少于 5 年', candidate_text: '', standard_bbox: '[]', candidate_bbox: '[]', review_required: true, engine: 'gooyoo', source: 'layout', review_status: 'pending' },
    { id: 'f5', task_id: 't1', diff_id: 'd-05', type: 'replace', page_index: 6, risk_level: 'medium', risk_category: '变更签证', standard_text: '设计变更须经发包人书面确认后实施，费用按实结算', candidate_text: '设计变更经发包人口头同意后可先行实施', standard_bbox: '[]', candidate_bbox: '[]', review_required: true, engine: 'gooyoo', source: 'layout', review_status: 'pending' },
    { id: 'f6', task_id: 't1', diff_id: 'd-06', type: 'replace', page_index: 7, risk_level: 'low', risk_category: '文本勘误', standard_text: '争议解决：提交项目所在地人民法院诉讼', candidate_text: '争议解决：提交项目所在地仲裁委员会仲裁', standard_bbox: '[]', candidate_bbox: '[]', review_required: false, engine: 'gooyoo', source: 'layout', review_status: 'pending' },
  ],
  risks: [
    { id: 'r1', rule_id: 'PAY-001', severity: 'high', title: '进度款支付比例下调 20 个百分点', description: '候选合同将月度支付 80% 改为季度支付 60%，现金流压力显著增大，且无补充说明。', evidence_text: '进度款按季度支付，支付比例为当季经审定已完成产值的 60%', review_status: 'pending' },
    { id: 'r2', rule_id: 'RISK-004', severity: 'high', title: '新增逾期违约金上限条款', description: '候选稿新增违约金上限为合同价款 10% 的条款，标准范本无此约定，需评估风险敞口。', evidence_text: '逾期违约金上限为合同价款的 10%', review_status: 'pending' },
    { id: 'r3', rule_id: 'QUA-002', severity: 'high', title: '防水工程保修条款被删除', description: '候选稿删除“防水工程保修期不少于 5 年”，低于《建设工程质量管理条例》最低要求风险。', evidence_text: '', review_status: 'pending' },
    { id: 'r4', rule_id: 'CHG-003', severity: 'medium', title: '变更签证确认方式弱化', description: '书面确认改为口头同意，结算争议风险上升。', evidence_text: '设计变更经发包人口头同意后可先行实施', review_status: 'pending' },
  ],
  reports: [
    { id: 'rep1', task_id: 't1', name: '智水园区二期施工总承包合同比对报告', report_type: 'compare', version: 'v2', creator: '本地用户', created_at: '2026-10-09 17:05' },
    { id: 'rep2', task_id: 't2', name: '商务楼精装修补充协议审查报告', report_type: 'risk', version: 'v1', creator: '本地用户', created_at: '2026-10-08 11:48' },
  ],
  rules: [
    { id: 'rr1', rule_id: 'PAY-001', name: '进度款支付比例偏离检查', scope: 'standard', clause_type: '付款条款', severity: 'high', status: 'published', version: 'v3' },
    { id: 'rr2', rule_id: 'QUA-002', name: '防水保修期不得低于法定年限', scope: 'standard', clause_type: '质保条款', severity: 'high', status: 'published', version: 'v2' },
    { id: 'rr3', rule_id: 'CHG-003', name: '变更签证书面确认缺失检测', scope: 'standard', clause_type: '变更签证', severity: 'medium', status: 'published', version: 'v1' },
    { id: 'rr4', rule_id: 'DIS-005', name: '争议解决方式变更提示', scope: 'standard', clause_type: '争议解决', severity: 'low', status: 'draft', version: 'v1' },
  ],
};
`;

const STOPS = [
  { url: '/#/dashboard', png: 'dashboard', wait: 1800 },
  { url: '/#/tasks', png: 'tasks', wait: 1400 },
  { url: '/#/tasks/t1/diff', png: 'diff', wait: 2600 },
  { url: '/#/tasks/t1/risk', png: 'risk', wait: 2200 },
  { url: '/#/rules', png: 'rules', wait: 1600 },
  { url: '/#/reports', png: 'reports', wait: 1600 },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(MOCK);
await page.addInitScript(DATA);
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));

for (const s of STOPS) {
  await page.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(s.wait);
  await page.screenshot({ path: `${OUT}/${s.png}.png` });
  console.log('shot:', s.png);
}
await browser.close();
errs.length && console.log('PAGE ERRORS:', [...new Set(errs)]);
console.log('done');
