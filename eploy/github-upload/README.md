# 简历排版工具 MVP

基于 Next.js + React + Tailwind CSS 的中英文简历排版工具。

## 功能

- 粘贴中文/英文简历原文并自动结构识别
- 识别字段：姓名、联系方式、求职意向、个人总结、教育经历、工作经历、项目经历、技能、证书/奖项
- 左侧可手动编辑识别结果，右侧实时预览
- 三套模板：商务正式、极简现代、轻设计高级版
- 导出 PDF（A4 自动分页）
- 导出 PNG 长图
- 浏览器打印兜底（可另存 PDF）

## 技术栈

- Next.js (App Router)
- React
- Tailwind CSS
- html2canvas
- jsPDF

## 本地运行

1. 安装 Node.js 20 LTS（或更高 LTS）
2. 安装依赖

```bash
npm install
```

3. 启动开发环境

```bash
npm run dev
```

4. 打开浏览器

```text
http://localhost:3000
```

## 零命令行启动（推荐）

如果你不想输入任何命令，直接双击：

- `double-click-start.vbs`：自动安装依赖（首次）、启动服务并自动打开网页
- `double-click-stop.vbs`：停止本地服务

说明：

- 首次启动会更慢（通常 2-5 分钟），因为会自动安装依赖
- 启动器日志在 `.launcher/` 目录

## 项目结构

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  editor/
    InputPanel.tsx
    ResumeEditor.tsx
  preview/
    ResumePreview.tsx
    templates/
      BusinessTemplate.tsx
      MinimalTemplate.tsx
      PremiumTemplate.tsx
      TemplateCommon.tsx
  resume-builder/
    ResumeWorkspace.tsx
lib/
  parser.ts
  exporters.ts
  defaults.ts
  utils.ts
types/
  resume.ts
```

## 识别逻辑说明（MVP）

- 标题词典匹配（中英别名）+ 段落分块
- 联系方式优先用正则抽取（电话/邮箱/URL）
- 教育/工作/项目按时间模式和分段结构解析
- 未归类内容会显示在左侧提示区，支持手动补充

## 已知限制

- 规则识别对极端非结构化文本准确率有限
- 导出依赖浏览器渲染结果，复杂内容在不同浏览器可能有细微差异
- 当前未做服务端存储与多端同步

## 后续可扩展建议

1. 增加 AI 解析插件接口（保留当前规则解析为 fallback）
2. 增加 JSON 导入导出，支持简历版本管理
3. 增加多语言模板文案与主题变量系统
4. 增加模板微调能力（间距、字号、强调色）
5. 增加岗位定制关键词建议和一键润色
