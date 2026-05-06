# 企业方案 PDF 模板（已验证可靠）

> 经多个企业方案验证，此方式可靠。
> **当用户要求 PDF 输出时，不要用 baoyu-markdown-to-html → Chromium**（微信文章风格在 A4 上排版错乱，且 HTML 后处理极其繁琐）。
> **不要用 huashu-md-to-pdf**（要求 `## 1. Title` 格式，不匹配 TOC 为空，WeasyPrint 兼容性差）。

## 核心原则

**直接写干净的 HTML，一条链：Markdown 内容 → 手写 HTML → Chromium PDF。** 不经过 baoyu。

## 为什么不用 baoyu

| 问题 | 根因 |
|------|------|
| 表格在 PDF 里乱套 | baoyu 给每个 table 套 `<section style="overflow:auto">`，Chromium 打印时 DIV 嵌套崩溃 |
| 图片撑满整页 | baoyu 给所有 img 加 `width:100%`，logo 变巨幅 |
| 正文太大 | 16px 正文在 A4 纸上显得松散 |
| 标题风格不适 | 居中白字蓝底的 H2 在手机上好看，打出来像海报 |
| HTML 后处理巨繁琐 | 需要在生成后手动改 padding、加品牌栏、删 logo、拆 section 壳——4 步以上纯体力活 |

## 正确流程（3 步，一条链）

### Step 1: 写 Markdown 内容

按标准结构写（和之前一样），但 **不在 Markdown 里放 `![logo]`**。

```markdown
# 潮汐AI赋能方案
## 公司名称 · 行业定制

> **核心价值主张一句话。**

---

## 关于XX公司
...
```

结构顺序：
1. Hero 区（一句话价值主张）
2. 关于公司
3. AI 行业趋势（表格）
4. 行业痛点（表格）+ IO流程图
5. 赋能方案总览（表格）+ 三层架构图
6. 课表详情（多个表格，按模块展开）
7. 效果展示（表格）
8. 岗位推荐/技术说明
9. 实施节奏图
10. CTA

### Step 2: 手写干净 HTML

**关键规则：**
- 表格直接用 `<table>`，不套任何 `<section>` 壳——无 `overflow:auto`
- 品牌栏放在 `<body>` 最顶部，Logo 60px
- 正文 13px，表格 12px
- 所有图片不加 width:100%
- `page-break-inside: avoid` 防止表格被截断
- CSS 放在 `<style>` 里，内联尽量简洁

**完整 HTML 模板（直接复制替换内容）：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  @page { margin: 15mm 18mm; size: A4; }
  body { font-family: "PingFang SC","Microsoft YaHei",sans-serif; font-size: 13px; color: #222; line-height: 1.8; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 2px solid #0F4C81; margin-bottom: 24px; }
  .header img { width: 60px; height: auto; }
  .header span { font-size: 12px; color: #888; }
  h1 { font-size: 22px; text-align: center; color: #0F4C81; margin: 30px 0 5px; }
  .subtitle { text-align: center; font-size: 16px; color: #333; margin: 0 0 6px; }
  .hero { background: #f0f4f8; border-left: 4px solid #0F4C81; padding: 14px 18px; margin: 20px 0; font-size: 13px; }
  h2 { font-size: 17px; color: #0F4C81; margin: 30px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
  h3 { font-size: 14px; color: #333; margin: 20px 0 8px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 12px; page-break-inside: avoid; }
  th { background: #0F4C81; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; }
  td { padding: 7px 10px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) td { background: #f9fafb; }
  blockquote { border-left: 3px solid #0F4C81; padding: 8px 14px; margin: 14px 0; background: #f7f9fb; color: #555; font-size: 12px; }
  img.diagram { max-width: 100%; margin: 16px auto; display: block; }
  .cta { background: #0F4C81; color: #fff; padding: 16px 20px; margin-top: 30px; text-align: center; border-radius: 4px; font-size: 14px; }
  .note { font-size: 11px; color: #999; }
</style>
</head>
<body>

<div class="header">
  <img src="https://chaoxi.live/portal/chaoxiBlue-icon.png" alt="潮汐AI" style="width:60px;height:auto;">
  <span>AI赋能方案 | 公司名称 | 2026年X月</span>
</div>

<h1>潮汐AI赋能方案</h1>
<div class="subtitle">公司名称 · 行业定制</div>
<div class="hero"><strong>核心价值主张一句话。</strong></div>

<h2>关于公司</h2>
<p>公司简介...</p>

<h2>AI 正在重塑XX行业</h2>
<table>
<tr><th width="35%">趋势</th><th>影响</th></tr>
<tr><td>趋势1</td><td>描述</td></tr>
</table>

<h2>行业核心痛点</h2>
<table>
<tr><th>痛点</th><th>现状</th><th>AI 方案</th></tr>
<tr><td>痛点1</td><td>现状</td><td>方案</td></tr>
</table>
<img class="diagram" src="diagrams/IO流程图.png">

<!-- 课表表格按模块展开，每个模块一个 h3 + 表格 -->

<h2>效果展示</h2>
<table>
<tr><th>场景</th><th>赋能前</th><th>赋能后</th><th width="10%">提效</th></tr>
<tr><td>场景1</td><td>前</td><td>后</td><td><strong>N倍</strong></td></tr>
</table>

<img class="diagram" src="diagrams/实施节奏图.png" alt="实施节奏">

<div class="cta">
  <p><strong>📩 转发给贵司技术负责人</strong></p>
  <p style="font-size:12px; opacity:0.85">获取详细课程大纲与报价方案</p>
  <p style="font-size:11px; opacity:0.7">潮汐AI · 赋能方案 | 公司 | 2026年X月</p>
</div>
</body>
</html>
```

### Step 3: Chromium 生成 PDF

```bash
chromium --headless --disable-gpu \
  --print-to-pdf="输出.pdf" \
  --no-pdf-header-footer \
  "file:///绝对路径/输出.html"
```

## 图表清单（强制 ≥3 张 draw.io，类型按场景选）

| 图类 | 适用场景 | draw.io 风格 |
|------|---------|-------------|
| IO流程图 | 数据流/业务流程 | 三列对比（输入→AI处理→输出） |
| 架构图/分层图 | 三层赋能体系/课程结构 | 分层框 + 箭头连接 |
| 甘特图/时间线 | 实施节奏/阶段安排 | 多行甘特图 + 时间列头 |
| 对比图 | 赋能前 vs 赋能后 | 左右对照表 |
| 业务流程图 | 具体业务场景（如预警→推送） | 流程框 + 条件分支 |

> 图不够时优先补业务流程图——从方案内容中找一个核心业务场景画成流程图。

## 常见翻车与解决

| 现象 | 根因 | 修复 |
|------|------|------|
| PDF 表格乱套 | baoyu 的 `<section overflow:auto>` 壳 | 不用 baoyu，手写 `<table>` |
| Logo 不见了 | 旧版依赖本地 `diagrams/logo.png` | 已改用远程URL `https://chaoxi.live/portal/chaoxiBlue-icon.png`，无需本地文件 |
| Logo 巨大 | baoyu 给 img 加了 `width:100%` | 品牌栏中 logo=`width:60px`，不在正文放 logo |
| 图导出超时 | draw.io MCP session 断开 | `browser_navigate` 刷新 → 重试导出 |
| 文字出现 `<b>` 乱码 | draw.io 不支持 HTML 标签 | 拆成独立 mxCell，fontStyle=1 加粗 |
