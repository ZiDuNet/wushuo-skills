---
name: chaoxi-ai-course-recommendation
version: 1.0.0
description: "潮汐AI赋能方案 — 根据场景自动生成AI企业赋能宣传材料。支持5种场景：泛销售介绍（L1）、行业/企业方案（L2）、企业内部深度方案（L3）、渠道合作贴牌（L4）、学校合作（L5）。输出格式包括HTML、PDF、PPT、海报等。当用户说'出个介绍'、'给XX公司做方案'、'生成赋能方案'、'AI提效方案'、'给客户做课表'、'组织智能升级'、'渠道合作'、'招生宣传'时触发。也适用于任何涉及AI企业赋能、提效方案、宣传材料生成的场景。"
---

# 潮汐AI赋能方案 Skill

## 一、业务定位

**核心价值：** 根据场景和受众，动态生成AI赋能宣传材料——从通用介绍到深度定制方案。

**输出格式：** HTML / PDF / PPT / 海报（根据场景自动匹配，用户可指定）

**输出受众：**
- 泛销售人群 → 看了就想深入了解
- 行业渠道 → 看了就愿意转发
- 企业内部 → 看了就能拿去给领导汇报
- 渠道商 → 看了就想贴牌去卖

**关键原则：业务语言优先**
- 不说 "web coding"、"Agent"、"Skill"、"MCP"
- 说 "组织人员提效"、"组织协作加速"
- 客户领导在乎"我的人能不能干活更快"

---

## 二、三大业务单元框架

| 业务单元 | 面向对象 | 核心逻辑 | 当前状态 |
|----------|----------|----------|----------|
| **组织人员提效** | 个体（非协作场景） | PPT、Excel、PDF、开发、数据分析等个人提效 | 可做 |
| **组织协作加速** | 团队（协作场景） | 工作流、数据流——跨角色信息流转、工作汇报 | 可做 |
| **组织能力进化** | 组织（变革层面） | 提效+加速后组织形态变化 | 待验证 |

> 当前先做前两个方向。

---

## 三、课程结构（每个 Unit = 2天 = 4个半天）

### 半天标准时间安排

上午场（9:00-12:00）：

| 时段 | 类型 | 说明 |
|------|------|------|
| 9:00-10:30 | 理论讲解 | 核心概念 + 方法论 + 讲师现场演示 |
| 10:30-10:45 | 休息 | — |
| 10:45-12:00 | 实操演练 | 跟着讲师做，用客户真实数据/场景 |

下午场（14:00-17:00）：

| 时段 | 类型 | 说明 |
|------|------|------|
| 14:00-15:30 | 场景实战 | 带着业务问题，用AI工具解决 |
| 15:30-15:45 | 休息 | — |
| 15:45-17:00 | 复盘产出 | 展示成果 + 总结方法论 + 布置后续练习 |

### 四个半天的内容框架

| 半天 | 定位 | 核心内容 | 产出物 |
|------|------|----------|--------|
| 第1个半天 | **AI基础能力建设** | AI工具操作 + 提示词方法论 + 常见场景演示 | 每人能独立完成基础AI对话任务 |
| 第2个半天 | **业务场景深度实操** | 根据客户行业选定一个高频痛点场景，深度实操 | 产出一个可直接用的业务模板/工作流 |
| 第3个半天 | **进阶场景拓展** | 第二个业务场景（可与场景A形成进阶关系） | 再产出一个业务模板，形成个人AI工具箱 |
| 第4个半天 | **综合实战落地** | 学员拿自己真实工作场景，讲师手把手指导 | 每人完成一个属于自己的AI提效方案 |

> **第1个半天不是固定扫盲**——根据客户AI成熟度灵活调整：
> - 零基础 → 从"什么是AI"讲起
> - 有经验但混乱 → 快速过基础，重点讲方法论和高效用法
> - 重度用户 → 跳过基础，直接进入场景实战

**天数确定流程：AI 推荐 + 用户确认。** AI 根据行业/客户/角色分析，推荐赋能天数和结构，向用户展示推荐理由，用户确认或调整后生成课表。Unit数量 = 天数 / 2（向上取整）。

**推荐逻辑：**
- L1（泛销售）：推荐 2-4 天通用方案，不展开课表
- L2（行业/企业）：根据行业特性推荐，如监测类项目推荐 4.5 天三层架构（决策层0.5 + 执行层2 + 落地层2），工程设计类推荐 6 天三模块（M1+M2+M3各2天）
- L3（企业内部）：根据团队规模、痛点深度、AI 成熟度推荐，通常 4-6 天
- L4（渠道合作）：根据目标角色推荐，通常 2-4 天
- L5（学校合作）：根据合作模式推荐

---

## 四、角色划分

| 角色 | 关注点 |
|------|--------|
| **中高层领导** | 看方向、看ROI、做决策 |
| **办公室/数据岗** | 日常办公提效 |
| **技术岗** | AI编程、自动化、工具链 |

> 角色可以更多，不同行业角色也会不同。

---

## 五、四层内容架构

> 所有场景生成的材料必须包含四个层次，缺一不可。
> 详见 [references/content-framework.md](references/content-framework.md)

| 层次 | 内容 | 说明 |
|------|------|------|
| **业务内容** | 课程设计、课表安排、知识库素材 | 核心价值 |
| **背景内容** | AI 行业趋势、最新新闻、生产力数据 | 紧迫感——"不搞不行了" |
| **形象包装** | 视觉设计、多页排版、专业商务风格 | 专业感——"一看就是专业团队" |
| **市场化描述** | CTA（行动号召）、营销用词、价值主张 | 行动力——"立刻想行动" |

---

## 六、场景识别与路由

> 根据用户输入自动判定场景，每种场景有独立的执行流程和输出规范。

### 场景判定

| 用户输入特征 | 场景 | 说明 |
|-------------|------|------|
| "出一份最新介绍"/"给我们做个宣传页"/无具体公司 | **L1 泛销售** | 无需客户信息 |
| "给工程行业出个方案"/"给中建三局做个方案" | **L2 行业/企业** | 只输入行业名或公司名 |
| 提供会议录音/纪要/具体企业沟通记录 | **L3 企业内部** | 深度定制 |
| "渠道合作"/"跟XX协会合作办课"/"角色化招生" | **L4 渠道合作** | 可贴牌 |
| "跟XX学校/清华合作办课" | **L5 学校合作** | 定向适配 |

> 如果用户没明确说场景：有会议录音 → 默认 L3；只有公司名 → 默认 L2；什么都没给 → 默认 L1

### 各场景差异一览

| 维度 | L1 泛销售 | L2 行业/企业 | L3 企业内部 | L4 渠道合作 | L5 学校合作 |
|------|----------|-------------|------------|------------|------------|
| **输入** | 无 | 行业/公司名 | 会议录音/纪要 | 渠道商信息 | 学校+渠道 |
| **客户概况** | 通用 | 行业概况 | 具体企业分析 | 渠道+角色 | 学校+渠道 |
| **痛点** | 通用痛点 | 行业典型痛点 | 客户真实痛点 | 角色典型痛点 | 渠道定制 |
| **课表** | 通用概览 | 行业定制 | 深度定制 | 角色化 | 渠道定制 |
| **品牌** | 潮汐AI | 潮汐AI | 潮汐AI | **合作伙伴优先** | 视情况 |
| **CTA** | 联系我们 | 转发相关人 | 申请预算 | 开班报名 | 期待确认 |
| **页数** | 5-8页 | 8-12页 | 10-15页 | 5-8页 | 视情况 |
| **默认格式** | 竖版HTML | 竖版HTML | 横版HTML | 竖版HTML | 视情况 |
| **详细规范** | [L1](references/scenario-L1-general.md) | [L2](references/scenario-L2-industry.md) | [L3](references/scenario-L3-enterprise.md) | [L4](references/scenario-L4-channel.md) | [L5](references/scenario-L5-school.md) |

---

## 七、执行流程

### 并行执行原则

> 如果当前 agent 支持调用 subagent，必须对可并行的任务进行并行处理，不要串行等待。

**明确可并行的任务：**
- WebSearch 多个维度的搜索（AI动态、行业案例、公司信息、竞品动态）→ 同时发起
- 知识库 sync + WebSearch 背景搜索 → sync 完成后浏览目录树，同时 WebSearch 可以并行
- 读取多个知识库文档 → 并行读取（用 `--cached` 前缀，走本地缓存，可并发）
- 读取 references 参考文件（content-framework.md + 场景文件）→ 并行读取

**必须串行的任务：**
- 场景识别 → 之后才能读对应场景文件
- 天数推荐 → 用户确认 → 之后才能设计课表
- 格式确认 → 之后才能生成输出

### Step 1: 场景识别

根据用户输入判定场景（见上方场景判定表）。识别后读取对应的场景文件。

### Step 2: 按场景执行

按对应场景文件中的执行流程操作。各场景的流程差异：

| 场景 | 客户画像 | 天数推荐 | 知识库拉取 | 背景搜索 | 格式选择 |
|------|----------|----------|------------|----------|----------|
| L1 | 跳过 | AI推荐2-4天 | ✅ 读总览 | ✅ 搜AI新闻 | HTML/PDF/海报 |
| L2 | WebSearch 搜行业 | AI推荐（根据行业特性） | ✅ 读总览+行业相关 | ✅ 搜行业AI案例 | HTML/PDF/PPT |
| L3 | 从材料提取+WebSearch | AI推荐（根据客户分析） | ✅ 深度拉取 | ✅ 搜公司+行业 | HTML/PPT/PDF |
| L4 | WebSearch 搜渠道商 | AI推荐2-4天 | ✅ 读总览+角色相关 | ✅ 搜角色AI应用 | HTML/PDF/海报 |
| L5 | WebSearch 调研学校 | AI推荐 | ✅ 读总览+渠道相关 | ✅ 搜学校信息 | 视情况 |

### Step 3: 拉取知识库素材

> 课程内容不能凭空编造，必须从飞书知识库获取最新素材。
> 知识库目录结构和文档内容会动态变化，**不写死任何节点信息**。

```bash
# 脚本路径（相对于 SKILL.md 所在目录）
SCRIPT="./scripts/feishu-wiki.js"

# 1. 同步知识库到本地缓存（检查版本，变了才拉取）
node $SCRIPT sync Y6cVwowzViqpEFkLpEvcC0LNnEn 3

# 2. 查看知识库目录结构
node $SCRIPT --cached tree

# 3. 按关键词搜索文档（标题+内容全文匹配）
node $SCRIPT --cached find "关键词"

# 4. 读取具体文档内容（用 find 结果中的 obj_token）
node $SCRIPT --cached read-doc <obj_token>
```

**拉取顺序：**
1. 先读「课程体系总览」→ 获取课程信息、技能编号、学习路径
2. 浏览完整目录树，充分了解知识库有哪些素材可用
3. 根据场景和客户画像自主决定读取哪些文档——不限关键词、不限数量
4. 评估素材覆盖度 → 哪些模块有成熟素材，哪些需要补充设计

### Step 4: 确认输出格式

向用户确认输出格式。各场景支持的格式不同，从对应场景文件中获取可选项。

**默认格式（用户未指定时）：**
- L1/L2/L4 → HTML（竖版，手机友好）
- L3 → HTML（横版，PPT 风格）
- L5 → HTML

> 如果用户一开始就指定了格式（如"生成PPT"），直接用用户的指定，跳过此步骤。

### Step 5: 生成输出

根据场景文件中的输出规范生成材料。生成前读取：
- `references/content-framework.md`（四层内容架构 + 措辞规范）
- 对应场景文件（组件清单、格式要求、CTA 设计）
- **如果用户要求 PDF 输出**，优先使用 `references/shiyuan-style-template.md` 的「手写干净 HTML → Chromium PDF」链路（v2，已验证可靠）。**不要走 baoyu → 后处理 → Chromium**（微信风格 HTML 表格 DIV 嵌套在 PDF 中崩溃），也不要用 huashu-md-to-pdf。

保存到当前工作目录。

### Step 5.5: 输出前质量检查（HTML/PDF 生成前必须）

> ⚠️ 以下检查项直接影响客户交付质量，缺一不可。

**生成 HTML/PDF 前逐项检查：**

| 检查项 | 说明 | 参考 |
|--------|------|------|
| ✅ **至少 3 张 draw.io 图** | 🔴 强制：每个方案必须包含 ≥3 张 draw.io 图表，类型按场景灵活选择（见下方图表规则）。图不够 = 不合格 | 见下 |
| ✅ **Logo 在品牌栏** | Logo 必须在页面顶部品牌栏，不在正文中 | P6 |
| ✅ **无正文残留 Logo** | Markdown 中的 Logo 引用必须删除 | P6 |
| ✅ **无 ASCII 图表** | 搜索 `┌─┐│└┘├┤` 如有残留替换为 draw.io | P5 |
| ✅ **无"录音转文字"** | 建筑业/制造业一线场景必须规避 | P4 |
| ✅ **措辞合规** | "赋能方案"非"培训方案"，"赋能模块"非"课程" | 措辞规范 |

**🔴 图表强制规则（不可绕过）：**

每个方案必须包含 **≥3 张 draw.io 图表**。少于 3 张 = 不合格，不得交付。

图表类型按客户行业和方案内容灵活选择，常见可选类型：

| 图类 | 适用场景 | draw.io 风格 |
|------|---------|-------------|
| **IO流程图** | 数据流/业务流程 | 三列对比（输入→AI处理→输出） |
| **架构图/分层图** | 三层赋能体系/课程结构/系统架构 | 分层框 + 箭头连接 |
| **甘特图/时间线** | 实施节奏/阶段安排 | 多行甘特图 + 时间列头 |
| **对比图** | 赋能前 vs 赋能后/方案对比 | 左右对照表 |
| **金字塔图** | 能力层级/优先级 | 三角形分层 |
| **业务流程图** | 具体业务流程（如预警→推送→处理） | 流程框 + 条件分支 |

> 图不够时，优先补业务流程图——从方案内容中找一个核心业务场景画成流程图。

**HTML 后处理流程（仅 HTML 输出格式需要，PDF 走世源风格模板不经过此步骤）：**

1. 添加品牌栏到 `<body>` 顶部（见 P6 代码模板）
2. 删除正文内容中的残留 Logo `<img>` 引用（搜索 `alt="潮汐AI"` 定位并删除）
3. 调整 body padding 和 #output padding 使品牌栏贴边
4. 重新用 Chromium 生成 PDF：`chromium --headless --disable-gpu --print-to-pdf="xxx.pdf" --no-pdf-header-footer "file:///xxx.html"`

**常用图表与对应 draw.io 类型：**

| 原 ASCII 图表类型 | draw.io 对应风格 | 要素 |
|------------------|-----------------|------|
| 三层/多层架构图 | 分层框 + 箭头连接 + 侧标色块 | 每层含图标、标题、角色、时长、目标 |
| 输入→处理→输出流程图 | 三列对比 + 箭头 + 5行场景 | 列头用蓝/紫/绿色区分 |
| 实施节奏时间线 | 三行甘特图 + 月份列头 | 每行含3个阶段节点 + 箭头连接 |

> **三层架构图模板**：`templates/三层赋能架构.drawio`（决策层/执行层/落地层标准分层布局，替换客户名和内容即可复用）

**「够用版」监测/运维项目模式：** 详见 [references/gouyong-pattern.md](references/gouyong-pattern.md)。当客户明确说「不做顶级算法，够用即可」（常见于桥梁/隧道/大坝/设备监测项目）时，课表设计严格遵循：阈值预警用统计规则不训练模型、趋势分析用AI辅助可视化不做预测、异常过滤用规则引擎不做信号处理、报表用模板填充。

**draw.io 导出超时处理：**
- 如果 `mcp_drawio_export_diagram` 返回 timeout，用 `browser_navigate` 刷新 draw.io 页面后重试导出
- 每张图创建后立即导出，不要批量堆积到最后

**P5（附属）: 图表嵌入后必须重走生成全流程**（仅 HTML 输出格式）

- 现象：在已生成的 Markdown 中插入 `![图表](diagrams/xxx.png)` 后，直接手动编辑 HTML 插入 `<img>` 会导致样式不一致
- 正确流程：修改 Markdown → 重新生成 → 重新做后处理
- ⚠️ HTML 重生成后原有修复会丢失，必须全部重做
- ⚠️ baoyu 重生成时会自动备份旧 HTML 为 `.bak-YYYYMMDDHHMMSS`

**P8: draw.io 文本中禁止使用 HTML 标签/实体**

---

## 八、知识库访问工具

> 所有知识库操作通过 `feishu-wiki.js` 脚本完成，不使用 lark-cli。
> 脚本位置：SKILL.md 同目录下 `scripts/feishu-wiki.js`

### 核心概念

- **node_token**：知识库树中的节点ID（用于定位文档位置）
- **obj_token**：实际文档的ID（用于读取文档内容）
- 根节点 node_token：`Y6cVwowzViqpEFkLpEvcC0LNnEn`（总览节点，标题中含版本号如 v1.0.0）

### 命令参考

| 命令 | 说明 | 示例 |
|------|------|------|
| `sync <node> [depth]` | 同步知识库到本地缓存 | `node scripts/feishu-wiki.js sync Y6cVwowzViqpEFkLpEvcC0LNnEn 3` |
| `cache-status` | 查看缓存状态（版本、文档数） | `node scripts/feishu-wiki.js cache-status` |
| `--cached tree` | 从缓存读目录树 | `node scripts/feishu-wiki.js --cached tree` |
| `--cached find <关键词>` | 缓存全文搜索（标题+内容） | `node scripts/feishu-wiki.js --cached find 提示词` |
| `--cached read-doc <obj>` | ⚠️ 不可靠，见P1 | 建议用在线模式 `read-doc` 代替 |
| `read-doc <obj>` | **推荐** 在线读取文档内容（markdown） | `node scripts/feishu-wiki.js read-doc KT45d...` |
| `--cached list-nodes <node>` | 从缓存读子节点 | `node scripts/feishu-wiki.js --cached list-nodes KcIi...` |

### 缓存策略

1. 首次执行 `sync` 拉取知识库目录树到本地 `.wiki-cache/` 目录（位于 `scripts/.wiki-cache/`）
2. 后续执行 `sync` 时自动检查根节点标题中的版本号（如 v1.0.0）
3. 版本相同 → 跳过拉取，走本地缓存
4. 版本不同 → 全量重新拉取并更新缓存
5. 加 `--cached` 前缀的命令完全走本地，零API调用

### 注意事项

- 飞书知识库页面是 SPA，webReader/浏览器抓不到内容，必须用脚本
- `sync` 命令使用 App 凭证认证，不需要用户登录授权
- 每次执行 Skill 时应先 `sync` 一次以确保缓存最新

### ⚠️ 已知问题与避坑

**P1: `--cached read-doc` 不可靠 — 文档正文未缓存**
- 现象：`sync` 报告"缓存已是最新"，`--cached tree` 和 `--cached find` 正常工作，但 `--cached read-doc <obj_token>` 始终返回"缓存中未找到文档"
- 根因：`sync` 仅缓存目录树元数据（meta.json），不下载文档正文到 `docs/` 子目录
- **解决方案：读取文档内容时始终用在线模式 `read-doc <obj_token>`（不加 `--cached` 前缀）**
- 缓存仅用于 `tree` 和 `find` 操作，`read-doc` 走在线 API

**P2: 脚本 CWD 必须在 `scripts/` 目录**
- `.wiki-cache/` 基于 `__dirname`（即 `scripts/`）定位，不在 skill 根目录
- 运行命令时 `cd` 到 `scripts/` 目录，或在 skill 根目录使用 `node scripts/feishu-wiki.js`
- 两种方式都能正确找到缓存，但 `ls .wiki-cache/` 从根目录看不到（实际在 `scripts/.wiki-cache/`）

**P3: L3 HTML 生成不能用 delegate_task 单次完成**
- 现象：L3 横版 HTML（10-15页、完整课表、客户画像、行业数据）内容量过大，`delegate_task` 在 600s 超时
- **解决方案：在主 Agent 中直接生成 HTML，或拆分为多步（先生成内容大纲 → 再填充各页）**
- L1/L2/L4 页数较少（5-12页），delegate_task 通常可完成；L3 因课表展开到每个半天，内容量是其他场景的 2-3 倍

**P4: 建筑业/工地场景禁用"录音转文字"功能**
- 用户明确禁止（"不要有录音转文字这个"）—— 建筑工地环境嘈杂、涉及敏感对话、录音不切实际
- 替代方案：用「输入会议讨论要点→AI整理为结构化纪要」代替「录会议音频→AI转写」
- 影响范围：决策层纪要提炼、落地层会议纪要、课程安排的资料员场景等所有提到"录音""转写"的地方
- 适用于所有涉及建筑/工程/制造等一线现场行业的课程方案

**P6: baoyu-markdown-to-html 图片自动居中 — Logo 需手动修复为品牌栏**（仅 HTML 输出格式）

- 现象：即使用 `![alt](path)` 或 `<img>` 标签放在 Markdown 中，`baoyu-markdown-to-html` 转换器会将所有 `<img>` 加上 `display: block; margin: 0.1em auto 0.5em`，`auto` 左/右边距使图片强制居中
- 用户预期：Logo 应在页面左上角的品牌栏（header bar）中，不在正文内容区
- **正确做法（必须直接编辑 HTML，不能在 Markdown 层面解决）：**
  1. 在生成的 HTML 的 `<body>` 开头、`<div id="output">` 之前，添加品牌栏 div：
  ```html
  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:2px solid #0F4C81;margin-bottom:20px;">
  <img src="https://chaoxi.live/portal/chaoxiBlue-icon.png" alt="潮汐AI" style="width:60px;height:auto;">
  <span style="font-size:13px;color:#6B7280;">AI赋能方案 | 北京建工集团 | 2026年5月</span>
  </div>
  ```
  2. 将 `<body style="padding: 24px;...">` 改为 `<body style="padding: 0;...">`
  3. 给 `<div id="output">` 加上 `style="padding: 0 24px 24px;"` 保持正文内边距
  4. **删除**正文中残留的 Logo `<img>` 引用（Markdown 转换器会生成两份）
- 品牌栏配色：`border-bottom` 颜色使用主题色（default 主题为 `#0F4C81`）
- Logo 宽度：**60px**（与品牌栏文字等高，紧凑不抢眼。用户会反复纠正大小，60px 是验证过的合适尺寸），高度 auto 保持比例
- 此坑影响所有场景（L1-L5），每次 HTML 输出都需要手动执行此修复

**P7: draw.io 导出超时需刷新浏览器页**

- 现象：`mcp_drawio_export_diagram` 返回 `"Export timed out. Make sure the browser tab is open"`
- 根因：draw.io MCP session 的浏览器 tab 可能因空闲而断开
- **解决方案**：导出失败时，先执行 `browser_navigate(url="http://localhost:6002?mcp=<session-id>")` 刷新页面，再重试导出
- 每张图创建后立即导出，不要批量堆积到最后
- 现象：用户反馈"Markdown里边的所有Markdown图表，放在HTML跟PDF上解析不了"
- 根因：ASCII art（box-drawing characters `┌─┐│└┘├┤`）依赖等宽字体，HTML/PDF 中字体不一致导致错位
- **解决方案：使用 draw.io MCP 生成专业图表图片，替换所有 ASCII 图表**
- 常见需要替换的图表类型：架构图（三层/多层结构）、流程图（输入→处理→输出）、时间线/甘特图
- 图表生成后以 PNG 格式保存到 `diagrams/` 子目录，Markdown 中用 `![描述](diagrams/xxx.png)` 引用
- 详见 [references/diagram-generation.md](references/diagram-generation.md)

**P9: baoyu HTML → Chromium PDF 排版错乱（重大）**

- 现象：用户反馈"格式很乱"、"PDF排版乱套了"、"又乱套了"。根因有三层：
  1. **表格 DIV 嵌套**：baoyu 给每个 `<table>` 套 `<section style="overflow:auto">`，Chromium 打印时嵌套崩溃，表格错位
  2. **图片 width:100%**：baoyu 给所有 `<img>` 加 `width:100%`，Logo 撑满整页
  3. **微信风格排版**：16px 正文、居中白字蓝底标题，在 A4 纸上不适合正式文档
- ❌ **不要修复 baoyu 生成的 HTML**（后处理步数太多：拆 section 壳 + 改 padding + 品牌栏 + 删 logo + 调图片宽度 = 至少 5 步，且 read_file/write_file 循环容易搞坏文件）
- ✅ **解决方案：完全不用 baoyu，直接手写干净 HTML**（一条链：内容 → 手写 HTML → Chromium PDF）
  - 表格直接 `<table>`，不套任何 `<section>`——无 `overflow:auto`
  - Logo 放品牌栏（`width:60px`），正文中不放
  - 正文 13px，表格 12px
  - `page-break-inside: avoid` 防表格截断
- 详见 `references/shiyuan-style-template.md`（含完整 HTML 模板，复制改内容即可）
- 经多个企业方案验证：此方式一次过。

**P8: draw.io 文本中禁止使用 HTML 标签/实体**

- 现象：draw.io 导出的 PNG 中 `<b>`、`<br>`、`&#xa;` 等显示为**可见文字乱码**，无法换行或加粗，用户反馈"PDF 为啥有很多 b 标签"
- 根因：draw.io MCP 的 mxCell value 属性不支持 HTML 渲染——`&lt;b&gt;`、`&lt;br&gt;`、`&#xa;` 一律原样输出为乱码文本
- **解决方案**：每行文字用独立的 mxCell（type=text），粗体用 style 中的 `fontStyle=1`——详见 [references/diagram-generation.md](references/diagram-generation.md)「通用规则」
- 影响范围：所有 draw.io 图表（架构图、流程图、甘特图），100% 必现
- 本次踩坑：方案中因 `<b>` 标签重绘三次才修复

---

## 十、可移植性与自动安装

> 本 skill 设计为拿到新电脑上即可运行。以下每个依赖都有检测 + 自动安装逻辑。

### 启动自检脚本（每次加载 skill 时运行）

```bash
#!/bin/bash
# 潮汐AI课程推荐 skill 依赖自检
# 运行方式: bash <this_script>
set -e

MISSING=()

echo "=== 潮汐AI 依赖自检 ==="

# 1. node（必需 - feishu-wiki.js）
if command -v node &>/dev/null; then
  echo "✅ node $(node -v)"
else
  echo "❌ node 未安装"
  MISSING+=("node")
fi

# 2. chromium（PDF 输出时必需）
if command -v chromium &>/dev/null || command -v chromium-browser &>/dev/null; then
  echo "✅ chromium 已安装"
else
  echo "❌ chromium 未安装（PDF 输出需要）"
  MISSING+=("chromium")
fi

# 3. bun 或 npx（HTML 输出时需要，用于 baoyu-markdown-to-html）
if command -v bun &>/dev/null; then
  echo "✅ bun $(bun -v)"
elif command -v npx &>/dev/null; then
  echo "✅ npx 可用"
else
  echo "❌ bun/npx 未安装（HTML 输出需要）"
  MISSING+=("bun")
fi

# 4. feishu-wiki.js 依赖检查
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/scripts/feishu-wiki.js" ]; then
  echo "✅ feishu-wiki.js 已就绪"
else
  echo "❌ feishu-wiki.js 缺失"
  MISSING+=("feishu-wiki.js")
fi

# 汇总
if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "=== 缺少以下依赖，执行自动安装 ==="
  for dep in "${MISSING[@]}"; do
    case $dep in
      node)
        echo "📦 安装 node..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null && sudo apt install -y nodejs 2>/dev/null || echo "⚠️ 自动安装失败，请手动: apt install nodejs"
        ;;
      chromium)
        echo "📦 安装 chromium..."
        sudo apt update -qq && sudo apt install -y chromium-browser 2>/dev/null || echo "⚠️ 自动安装失败，请手动: apt install chromium-browser"
        ;;
      bun)
        echo "📦 安装 bun..."
        curl -fsSL https://bun.sh/install | bash 2>/dev/null || echo "⚠️ 自动安装失败，请手动: curl -fsSL https://bun.sh/install | bash"
        ;;
      "feishu-wiki.js")
        echo "⚠️ feishu-wiki.js 缺失，请确保 skill 完整克隆"
        ;;
    esac
  done
else
  echo ""
  echo "✅ 所有系统依赖已就绪"
fi

echo "=== 自检完成 ==="
```

### draw.io MCP 检测与配置

> draw.io MCP 是图表生成的唯一依赖。架构图/流程图/甘特图全依赖它。

**检测方法**：在 Hermes Agent 中调用 `mcp_drawio_start_session`，如果返回 session ID 则可用。

**不可用时自动引导配置**：

```bash
# 检测 draw.io MCP 是否在 config.yaml 中配置
HERMES_CONFIG="${HOME}/.hermes/config.yaml"
if [ -f "$HERMES_CONFIG" ] && grep -q "drawio" "$HERMES_CONFIG"; then
  echo "✅ draw.io MCP 已配置"
else
  echo "⚠️ draw.io MCP 未配置，需要添加到 $HERMES_CONFIG"
  echo ""
  echo "请将以下内容添加到 mcp_servers 段："
  echo ""
  echo "mcp_servers:"
  echo "  drawio:"
  echo "    type: stdio"
  echo "    command: npx"
  echo '    args: ["-y", "drawio-mcp"]'
  echo ""
  echo "添加后重启 Hermes 即可生效。"
fi
```

### Logo

远程 URL，零本地依赖：
```
https://chaoxi.live/portal/chaoxiBlue-icon.png
```

> HTML 模板中 `<img src="https://chaoxi.live/portal/chaoxiBlue-icon.png" ...>` 直接用，不需要复制任何文件。

### 完整迁移清单

| 步骤 | 操作 | 命令 |
|------|------|------|
| 1 | 克隆 skill | `git clone <repo> ~/.agents/skills/chaoxi-ai-course-recommendation` |
| 2 | 运行自检 | `bash ~/.agents/skills/chaoxi-ai-course-recommendation/scripts/check-deps.sh` |
| 3 | 配置 draw.io MCP | 在 `~/.hermes/config.yaml` 中添加 drawio MCP server |
| 4 | 重启 Hermes | `hermes restart` 或重新加载 |
| 5 | 验证 | 让 Hermes 执行「给我做个简短方案测试」 |

---

## 十一、从会议转写提取信息的技巧

> 会议转写文档是生成定制方案的最高价值信息源。
> 主要用于 L3（企业内部）和 L4（渠道合作）场景。

### 提取维度

| 提取维度 | 在转写中找什么 |
|---------|--------------|
| 团队角色 | "我是做XX的"、"我负责XX" |
| AI现状 | 提到具体工具名 |
| 核心痛点 | "我希望"、"如果能"、"现在还是" |
| 项目信息 | 功能点数、技术栈、代码量 |
| 决策者vs使用者 | 谁提需求、谁真正用 |

### AI成熟度判断

- **零基础**：没提过任何AI工具，或只说"听说过"
- **工具混乱期**（最常见）：提到多个不同工具但各自为战，用法停留在"问答式"
- **Agent入门期**：用过Claude Code/Cursor等Agent工具，但遇到"上下文污染"等问题
- **重度用户**：能写Skill/工作流，讨论Token成本和模型选择

### 痛点分类

1. **信息断层**：需求在角色间传递时信息丢失
2. **工具混乱**：团队用不同工具，缺乏统一方法论
3. **上下文管理**：AI跑偏、上下文污染、信息投喂不够
4. **质量瓶颈**：测试用例生成质量差、代码审查不规范
5. **管理事务**：PPT/纪要/进度跟踪/绩效考核消耗大量时间
