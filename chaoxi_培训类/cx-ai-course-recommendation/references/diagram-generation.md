# Draw.io 图表生成参考

> 用于将 Markdown 中的 ASCII 图表替换为专业 draw.io PNG 图片。
> draw.io MCP 已配置，使用 `mcp_drawio_start_session` → `mcp_drawio_create_new_diagram` → `mcp_drawio_export_diagram` 流程。

## 导出超时处理

`mcp_drawio_export_diagram` 偶尔超时。解决：先用 `browser_navigate` 打开 draw.io 页面（URL 从 session 获取），再重试导出。

## 图表类型一：三层架构图

适用场景：决策层/执行层/落地层三层结构展示。

**设计要点：**
- viewBox: 900×520
- 三行分层框：蓝(indigo) → 绿(emerald) → 橙(orange)
- 每框内容：图标 + 标题 + 角色 + 时长 + 目标
- 框间箭头连接
- 左侧色块标注「战略层」「战术层」「落地层」
- 框宽 640，居中(x=80~720)

**色板：**
| 层级 | fillColor | strokeColor |
|------|-----------|-------------|
| 决策层 | #EEF2FF | #4338CA |
| 执行层 | #ECFDF5 | #059669 |
| 落地层 | #FFF7ED | #EA580C |

**XML 模板见本会话中 `三层架构图` 的 mxGraphModel。**

---

## 图表类型二：赋能哲学 I/O 流程图

适用场景：输入→AI处理→输出 的三列对比流程。

**设计要点：**
- viewBox: 1000×460
- 三列列头：📥 你输入(蓝) / ⚡ AI处理(紫) / 📤 你拿到(绿)
- 5行场景，每行3个框 + 2个箭头
- 箭头用 text 元素 `→` 连接
- 底部放核心原则标语

**色板：**
| 列 | header fillColor | cell fillColor | cell strokeColor |
|----|------------------|----------------|------------------|
| 输入 | #DBEAFE | #EFF6FF | #93C5FD |
| 处理 | #EDE9FE | #F5F3FF | #C4B5FD |
| 输出 | #D1FAE5 | #ECFDF5 | #6EE7B7 |

---

## 图表类型三：实施节奏甘特图时间线

适用场景：3个月分阶段推进计划，三层并行展示。

**设计要点：**
- viewBox: 1000×540
- 顶部月份列头(深蓝底白字)：第1/2/3个月
- 三行：决策层(蓝) / 执行层(绿) / 落地层(橙)
- 每行左侧标签 + 3个阶段框 + 箭头连接
- 底部虚线框放试点建议(灰底)
- 每行阶段框颜色由浅到深递进

**色板(渐变)：**
| 层级 | 阶段1 fillColor | 阶段2 fillColor | 阶段3 fillColor | strokeColor基础 |
|------|-----------------|-----------------|-----------------|-----------------|
| 决策层 | #DBEAFE | #C7D2FE | #A5B4FC | #6366F1 / #818CF8 |
| 执行层 | #D1FAE5 | #A7F3D0 | #6EE7B7 | #10B981 / #34D399 |
| 落地层 | #FFEDD5 | #FED7AA | #FDBA74 | #F97316 / #FB923C |

---

## 通用规则

1. **禁止在 value 中使用任何 HTML 标签或实体**：`&lt;br&gt;`、`&lt;b&gt;`、`&#xa;`、`&#10;` 等形式在 draw.io MCP 导出的 PNG 中一律渲染为**可见的乱码文本**，不能换行也不能加粗。
2. **换行 = 独立文本元素**：每行文字用独立的 `mxCell`（type=`text`），通过 `y` 坐标控制行间距（通常 14-16px）。
3. **粗体 = `fontStyle=1`**：在 style 属性中加 `fontStyle=1`，不要在 value 里放任何标签。
4. **字体大小**：标题 17px / 副标题 13-14px / 内容 11px / 小字 9-10px
5. **图片保存路径**：`{output_dir}/diagrams/{图表名}.png`
6. **Markdown 引用**：`![描述](diagrams/{图表名}.png)`
7. **Logo 拷贝**：`cp {skill_dir}/assets/logo.png {output_dir}/diagrams/logo.png`

### 多行文本的标准写法

```xml
<!-- 每个 mxCell 只有一行纯文本，用 y 坐标控制行间距 -->
<mxCell id="t1" value="项目需求描述" style="text;fontSize=11;align=center;" vertex="1" parent="1">
  <mxGeometry x="50" y="95" width="160" height="16" as="geometry"/>
</mxCell>
<mxCell id="t2" value="+ 技术规范要求" style="text;fontSize=11;align=center;" vertex="1" parent="1">
  <mxGeometry x="50" y="111" width="160" height="16" as="geometry"/>
</mxCell>
<!-- 如果标题需要粗体，在 style 中加 fontStyle=1 -->
<mxCell id="t3" value="标题文字" style="text;fontSize=13;fontStyle=1;align=center;" vertex="1" parent="1">
  <mxGeometry x="100" y="65" width="200" height="18" as="geometry"/>
</mxCell>
<!-- 背景框覆盖文字区域实现卡片效果 -->
<mxCell id="bg" value="" style="rounded=1;fillColor=#EFF6FF;strokeColor=#93C5FD;" vertex="1" parent="1">
  <mxGeometry x="50" y="90" width="160" height="42" as="geometry"/>
</mxCell>
```

> ⚠️ **P8 踩坑记录（2026-05-05）**：世源科技方案中三张图全部因 `&lt;b&gt;` 和 `&lt;br&gt;` 在 PDF 中显示为乱码文字，被迫三图重绘三次才确认根本原因。正确做法如上——纯文本 + 独立元素 + fontStyle。

---

## 图表嵌入 → HTML 重生成工作流

在已有 Markdown 中插入图表后，必须重新生成 HTML 并重新做 P6 后处理：

### 步骤

1. **插入图表引用到 Markdown**：使用 `patch` 在合适位置插入 `![描述](diagrams/{图表名}.png)`
2. **重新生成 HTML**：`npx -y bun {baoyu_skill_dir}/scripts/main.ts <md_file> --theme default --keep-title`
3. **P6 后处理**（必须重新执行）：
   - 添加品牌栏到 `<body>` 顶部
   - 删除正文中残留的 Logo `<img>`
   - 修正 body padding 为 0，给 `#output` 加 padding
4. **重新生成 PDF**：`chromium --headless --disable-gpu --print-to-pdf=... --no-pdf-header-footer ...`

### 陷阱

- ⚠️ HTML 重生成后原有的 P6 修复会丢失，必须全部重做
- ⚠️ `baoyu-markdown-to-html` 会自动备份旧 HTML 为 `.bak-YYYYMMDDHHMMSS`
- ⚠️ 所有图片（Logo + 三张图表）路径必须相对于 HTML 文件所在目录解析

---

## 可复用 XML 模板

工程/制造/建筑行业 L2 方案标配三件套图表。XML 模板位于 `templates/` 目录，使用 `{{PLACEHOLDER}}` 标注需替换项：

| 模板文件 | 图表类型 | 适用场景 |
|----------|----------|----------|
| `templates/diagram-course-architecture.xml` | 三层架构图 | 展示 M1→M2→M3 递进关系 |
| `templates/diagram-io-flowchart.xml` | I/O 五场景流程图 | 输入→AI处理→产出对比 |
| `templates/diagram-course-gantt.xml` | 6天课程甘特图 | 半天级时间安排+产出目标 |

**使用方式**：读取模板 → 替换 `{{VAR}}` 占位符 → `mcp_drawio_create_new_diagram` 创建 → `mcp_drawio_export_diagram` 导出 PNG。
