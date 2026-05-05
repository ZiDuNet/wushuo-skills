---
name: ppt-expert-workflow
version: 1.0.2
description: >
  整合 DrawBookAI 专家工作流 + ppt-master 的混合 PPT 制作方法。
  先需求调研 → 资料检索 → 策划稿 → 卡片式SVG设计 → PPTX输出。
  当用户说"做PPT"、"生成PPT"、"制作演示文稿"时使用。
repo: https://github.com/ZiDuNet/wushuo-skills/tree/master/ppt-expert-workflow
---

# PPT 专家工作流 (Expert Workflow) v1.0.2

> 整合 DrawBookAI 四步专家工作流 + ppt-master SVG→PPTX 管线

## 🚀 启动检查（每次运行前执行）

**执行顺序，任一步失败即中止：**

### 1. 版本更新检测

```bash
# 按优先级尝试：GitHub HTTPS → Gitee/AtomGit HTTPS → GitHub SSH
git ls-remote https://github.com/ZiDuNet/wushuo-skills.git HEAD 2>/dev/null | awk '{print $1}' \
  || git ls-remote https://gitee.com/ZiDuNet/wushuo-skills.git HEAD 2>/dev/null | awk '{print $1}' \
  || git ls-remote git@github.com:ZiDuNet/wushuo-skills.git HEAD 2>/dev/null | awk '{print $1}'
```

- 成功 → 比对本地版本，有新版本则提示用户更新
- 全部失败 → **静默跳过**，继续使用当前版本

### 2. ppt-master 引擎检测与自动安装

```bash
# 检查 ppt-master 是否存在
if [ ! -d ~/.agents/skills/ppt-master/skills/ppt-master/scripts ]; then
  echo "ppt-master 未安装，正在自动下载..."
  # GitHub（国际）优先，AtomGit（国内镜像）兜底
  git clone https://github.com/hugohe3/ppt-master ~/.agents/skills/ppt-master 2>/dev/null \
    || git clone https://atomgit.com/hugohe3/ppt-master ~/.agents/skills/ppt-master 2>/dev/null \
    || git clone git@github.com:hugohe3/ppt-master ~/.agents/skills/ppt-master
  if [ $? -ne 0 ]; then
    echo "❌ 关键依赖下载失败：ppt-master"
    echo "   请尝试手动安装："
    echo "   git clone https://github.com/hugohe3/ppt-master ~/.agents/skills/ppt-master"
    echo "   或（国内）：git clone https://atomgit.com/hugohe3/ppt-master ~/.agents/skills/ppt-master"
    echo "   无法使用 ppt-expert-workflow，任务终止。"
    exit 1
  fi
  echo "✅ ppt-master 安装完成"
fi
```

- ppt-master 不存在 → 自动下载，GitHub → AtomGit → GitHub SSH 三级 fallback
- 全部失败 → 提示手动安装命令，任务终止

### 3. 已安装则更新（使用官方更新脚本）

```bash
if [ -d ~/.agents/skills/ppt-master/.git ]; then
  python3 ~/.agents/skills/ppt-master/skills/ppt-master/scripts/update_repo.py 2>/dev/null || true
fi
```

> ppt-master 官方更新方式：`python3 scripts/update_repo.py`，会自动处理远程源。

---

## 依赖

**唯一依赖：**

| Skill | 安装 |
|---|---|
| ppt-master | 自动下载（GitHub → AtomGit 国内镜像 → SSH 三级 fallback） |

> 无其他依赖。无需安装 guizang-ppt-skill / html-ppt-skill / gpt-image2-ppt / huashu-slides。

---

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
python3 ~/.agents/skills/ppt-master/skills/ppt-master/scripts/project_manager.py init <project_name> --format ppt169
```

然后按 ppt-master 流程：Strategist → Image_Generator → Executor → Post-processing → Export。

---

### Step 5: 输出与交付

```bash
python3 scripts/total_md_split.py <project_path>
python3 scripts/finalize_svg.py <project_path>
python3 scripts/svg_to_pptx.py <project_path> -s final
```

---

## 默认策略

1. **首选 ppt-master 管线**：素材→SVG→PPTX，最成熟
2. **必须加策划稿环节**：在 Strategist 和 Executor 之间
3. **强制 Bento Grid**：所有非模板页面默认用卡片式布局
4. **先搜索后设计**：无源材料时，先 web_search 获取行业数据
5. **用户是总监，AI 是专家团队**：信息充分时不中断确认，直接推进
6. **快速通道**：当用户明确给出了受众（如"对外展示"）时，跳过八项确认，默认值：
   - 对外展示 → B) General Consulting
   - 内部汇报 → C) Top Consulting
   - 科技品牌 → 品牌主色 + 深色底 + 白
   - 数据密集型 → body 18px，无图片
   - 图标 → tabler-filled
   - 画布 → ppt169

## 参考案例

### 小米汽车对外展示PPT（2026年5月）
- 配色：小米橙 `#FF6900` + 深灰 `#1A1A2E`/`#0F0F1A`
- 卡片面：`#1E1E36` / `#FFFFFF`
- 字体：Microsoft YaHei，body 18px，title 36px，hero 48px
- 布局：Bento Grid 卡片式，暗黑科技风

---

## 关键词
`PPT` `专家工作流` `Bento Grid` `卡片式布局` `金字塔原理` `策划稿` `SVG` `ppt-master`
