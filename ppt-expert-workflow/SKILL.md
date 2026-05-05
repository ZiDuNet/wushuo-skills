---
name: ppt-expert-workflow
description: >
  整合 DrawBookAI 专家工作流 + ppt-master 的混合 PPT 制作方法。
  先需求调研 → 资料检索 → 策划稿 → 卡片式SVG设计 → PPTX输出。
  当用户说"做PPT"、"生成PPT"、"制作演示文稿"时使用。
---

# PPT 专家工作流 (Expert Workflow)

> 整合 DrawBookAI 四步专家工作流 + ppt-master SVG→PPTX 管线

## 核心理念

**PPT 是思考，不是设计。** 市面 99% AI PPT 工具跳过"需求调研→资料搜集"直接出结果，导致内容空洞。

本工作流模拟人类专家团队：需求调研 → 资料检索 → 策划稿 → 设计稿。

## 完整流程（5步）

### 0. 预检：用户有无源材料？

| 情况 | 路径 |
|---|---|
| 用户给了 PDF / DOCX / MD / URL | → 用 ppt-master Step 1 转换，然后走本流程 |
| 用户只给了主题/想法 | → 从本流程 Step 1 开始，搜索+架构 |

---

### Step 1: 需求调研（先当顾问）

**目标**：不急着出大纲，先问清楚。

用 DrawBookAI 的「顶级的PPT结构架构师」角色问三件事：
1. **为谁做？** 观众是谁？什么身份/技术水平？
2. **做什么？** 主题范围？核心信息？
3. **达到什么目的？** 说服？汇报？培训？展示？

工具：`web_search` 搜索背景资料（行业现状、最新数据、竞品情况）。

**输出**：调研摘要（200字内），确认后再进下一步。

---

### Step 2: 大纲策划（金字塔原理）

用 ppt-master Step 4 Strategist Phase 的八项确认，加上金字塔原理：

1. 结论先行：每部分以核心观点开篇
2. 以上统下：上层观点是下层内容总结
3. 归类分组：同层内容属于同一逻辑范畴
4. 逻辑递进：按逻辑顺序展开

**输出**：`<project_path>/outline.json`（参考 DrawBookAI 的 JSON 结构）或 Markdown 大纲。

---

### Step 3: 策划稿（版面规划）★ 新增关键步骤

> 顶尖 PPT 公司（¥10,000+/页）有专门的"策划师"岗位。
> 策划师输出 PPT 草稿：每页什么位置放什么元素、什么版式。

**NOT 设计，是规划。**

对每一页定义：
- 页面标题
- 核心信息（1句话）
- 元素清单（标题/正文/图表/图片/卡片 ×N）
- 推荐布局（单一焦点 / 两栏 / 三栏 / 主次结合 / 顶部英雄式 / 混合网格）

**输出**：`<project_path>/planning_draft.md`

---

### Step 4: 设计稿（卡片式 SVG + 执行）

**布局系统：Bento Grid（便当网格）**

| 原则 | 说明 |
|---|---|
| 灵活性 | 卡片数量不固定，1~N 个，取决于内容 |
| 层级感 | 最重要信息放最大卡片 |
| 留白 | 卡片间距 ≥ 20px |
| 画布 | SVG viewBox 0 0 1280 720 |

**常见布局组合**：
- 单一焦点：1 张大卡片 (w=1200, h=580)
- 两栏对称：2 张等宽卡片
- 两栏非对称：主卡片 (2/3 宽) + 辅卡片 (1/3 宽)
- 三栏：3 张等宽卡片
- 主次结合：1 张大居中 + 2 张小侧边
- 顶部英雄式：顶部宽幅 + 下方 2-4 张小卡片
- 混合网格：自由组合不同尺寸

**执行方式**：用 ppt-master Step 6 Executor Phase 生成 SVG，但强制使用 Bento Grid 布局。

```bash
# 使用 ppt-master 的命令
python3 ~/.agents/skills/ppt-master/skills/ppt-master/scripts/project_manager.py init <project_name> --format ppt169
```

然后按 ppt-master 流程：Strategist → Image_Generator → Executor → Post-processing → Export。

**关键约束**：
- SVG 输出必须用 Bento Grid 卡片式布局
- 禁止套用僵硬模板
- 每页 SVG 生成前先读 spec_lock.md

---

### Step 5: 输出与交付

```bash
# 7.1 分割讲稿
python3 scripts/total_md_split.py <project_path>

# 7.2 SVG后处理
python3 scripts/finalize_svg.py <project_path>

# 7.3 导出PPTX
python3 scripts/svg_to_pptx.py <project_path> -s final
```

---

## 与其他 PPT Skill 的关系

| Skill | 本工作流中的定位 |
|---|---|
| **ppt-master** | 管线引擎：SVG生成 + PPTX导出 |
| **guizang-ppt-skill** | 特殊风格：电子墨水网页PPT（不常用） |
| **html-ppt-skill** | HTML演示文稿（不常用） |
| **gpt-image2-ppt** | 图片生成补充（需要AI插图时） |
| **huashu-slides** | 端到端替代方案（18种风格） |

---

## 安装依赖

ppt-expert-workflow 依赖以下 skill，未安装时从对应仓库获取：

| Skill | 必装 | 安装来源 | 安装方式 |
|---|---|---|---|
| **ppt-master** | ✅ 是 | https://github.com/hugohe3/ppt-master | `git clone` 到 `~/.agents/skills/ppt-master` |
| **guizang-ppt-skill** | 否 | 已打包在本导出中 | 复制到 skills 目录 |
| **html-ppt-skill** | 否 | 已打包在本导出中 | 复制到 skills 目录 |
| **gpt-image2-ppt** | 否 | 已打包在本导出中 | 复制到 skills 目录 |
| **huashu-slides** | 否 | 已打包在本导出中 | 复制到 skills 目录 |

> ⚠️ **ppt-master 是核心引擎**，没有它 ppt-expert-workflow 无法出 PPTX。安装后确保 `~/.agents/skills/ppt-master/skills/ppt-master/scripts/` 可执行。

---

## 默认策略

1. **首选 ppt-master 管线**：素材→SVG→PPTX，最成熟
2. **必须加策划稿环节**：在 Strategist 和 Executor 之间
3. **强制 Bento Grid**：所有非模板页面默认用卡片式布局
4. **先搜索后设计**：无源材料时，先 web_search 获取行业数据
5. **用户是总监，AI 是专家团队**：信息充分时不中断确认，直接推进；仅在方向模糊（缺少受众/用途/主题边界）时才提问
6. **快速通道**：当用户明确给出了受众（如"对外展示"）、主题边界清晰时，**跳过八项确认**，按以下默认值直接推进：
   - 对外展示/投资人/媒体 → B) General Consulting 风格
   - 内部汇报/管理层 → C) Top Consulting 风格
   - 科技/互联网品牌 → 品牌主色 + 深色底 + 白
   - 数据密集型 → body 18px，无图片
   - 图标 → tabler-filled（圆润科技感）
   - 画布 → ppt169 (16:9)

## 参考案例

### 小米汽车对外展示PPT（2026年5月）
- 配色：小米橙 `#FF6900` + 深灰 `#1A1A2E`/`#0F0F1A`
- 卡片面：`#1E1E36` / `#FFFFFF`
- 字体：Microsoft YaHei，body 18px，title 36px，hero 48px
- 布局：Bento Grid 卡片式，暗黑科技风
- 数据来源：web_search 实时检索（新浪财经、MarkLines、高盛等）

---

## 关键词
`PPT` `专家工作流` `Bento Grid` `卡片式布局` `金字塔原理` `策划稿` `SVG` `ppt-master`
