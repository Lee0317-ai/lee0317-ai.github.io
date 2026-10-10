# lee0317-ai.github.io

Lee 的个人作品集。**content/ 是唯一内容源**——改项目介绍只需编辑 `content/projects/*.md`，
推送后自动重建三处产物（静态版 / React 版 / 双版本简历）。

## 本地开发

    npm install
    npm test            # 构建脚本测试
    npm run build       # 产出 dist/
    npx serve dist      # 本地预览（/ 为静态版，/react/ 为 React 版）

改 content/ 后需重跑 npm run build 才会更新 React 版用的 data.json。

## 结构

- `content/` 内容源（profile.yaml + projects/*.md）
- `scripts/` 构建脚本（content → data.json → 静态页 / 简历页 / React）
- `sites/static` 静态版模板与样式；`sites/react` React 版
- `assets/screenshots/` 项目截图

## 简历导出

打开 `/resume/resume-tech.html` 或 `/resume/resume-biz.html`，Ctrl+P 打印为 PDF。
