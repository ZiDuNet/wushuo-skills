---
name: ppt-expert-workflow
version: 1.0.3
description: >
  整合专家工作流方法论 + ppt-master 的混合 PPT 制作方法。
  环境检查 → 读取材料 → 需求调研 → 策划稿 → 卡片式SVG设计 → PPTX输出。
  当用户说"做PPT"、"生成PPT"、"制作演示文稿"时使用。
repo: https://github.com/ZiDuNet/wushuo-skills/tree/master/ppt-expert-workflow
---

# PPT 专家工作流 (Expert Workflow) v1.0.3

> 整合四步专家工作流方法论 + ppt-master SVG→PPTX 管线

## 🚀 启动检查（每次运行前必须执行，不可跳过）

> **ppt-master 是硬性依赖，没有它整个工作流无法运行。环境检查失败 = 任务中止，不进入任何内容步骤。**

### 1. ppt-master 引擎检测与自动安装（必须通过）

> **已有 ppt-master 时不做任何干预**（不更新、不改 remote、不覆盖），直接使用。
> 仅在未安装时才自动下载。

安装源优先级：Gitee 镜像 → AtomGit 镜像 → ZiDuNet fork → 上游原版

```bash
if [ ! -d ~/.agents/skills/ppt-master/skills/ppt-master/scripts ]; then
  echo "ppt-master 未安装，正在自动下载..."

  # 方式1: git clone（需要 git）
  if command -v git &>/dev/null; then
    git clone https://gitee.com/Shuo_wu/ppt-master ~/.agents/skills/ppt-master 2>/dev/null \
      || git clone https://atomgit.com/hugohe3/ppt-master ~/.agents/skills/ppt-master 2>/dev/null \
      || git clone https://github.com/ZiDuNet/ppt-master ~/.agents/skills/ppt-master 2>/dev/null \
      || git clone https://github.com/hugohe3/ppt-master ~/.agents/skills/ppt-master 2>/dev/null \
      || git clone git@github.com:ZiDuNet/ppt-master ~/.agents/skills/ppt-master
  fi

  # 方式2: 无 git 时，用 curl 下载 ZIP
  if [ ! -d ~/.agents/skills/ppt-master/skills/ppt-master/scripts ]; then
    mkdir -p ~/.agents/skills/ppt-master
    cd /tmp && curl -sL https://github.com/ZiDuNet/ppt-master/archive/refs/heads/main.zip -o ppt-master.zip 2>/dev/null \
      || curl -sL https://github.com/hugohe3/ppt-master/archive/refs/heads/main.zip -o ppt-master.zip 2>/dev/null
    if [ -f ppt-master.zip ]; then
      unzip -q ppt-master.zip -d ppt-master-tmp && cp -r ppt-master-tmp/*/* ~/.agents/skills/ppt-master/
      rm -rf ppt-master.zip ppt-master-tmp
    fi
  fi

  # 最终检查：ppt-master 安装失败时，尝试使用用户已有的 PPT skill
  if [ ! -d ~/.agents/skills/ppt-master/skills/ppt-master/scripts ]; then
    echo "⚠️ ppt-master 自动安装失败，正在查找本机已有的 PPT skill..."
    existing_skill=""
    for skill_dir in ~/.agents/skills/*/skills/*/SKILL.md; do
      if [ -f "$skill_dir" ] && grep -qi "ppt\|slide\|presentation" "$skill_dir" 2>/dev/null; then
        existing_skill="$skill_dir"
        break
      fi
    done
    if [ -n "$existing_skill" ]; then
      echo "✅ 找到已有 PPT skill: $existing_skill"
      echo "   将使用该 skill 作为替代引擎。"
      echo "   注意：部分高级功能（Bento Grid、自动策划稿）可能不可用。"
    else
      echo "❌ 未找到任何 PPT skill，任务中止。请手动安装："
      echo "   Gitee(镜像):   https://gitee.com/Shuo_wu/ppt-master → 克隆/下载"
      echo "   GitHub(fork):  https://github.com/ZiDuNet/ppt-master → Code → Download ZIP"
      echo "   AtomGit(镜像): https://atomgit.com/hugohe3/ppt-master → 克隆/下载"
      echo "   GitHub(上游):  https://github.com/hugohe3/ppt-master → Code → Download ZIP"
      echo "   解压到 ~/.agents/skills/ppt-master/"
      exit 1
    fi
  else
    echo "✅ ppt-master 安装完成"
    # 标记为本 skill 自动安装，后续可自动更新
    touch ~/.agents/skills/ppt-master/.ppt-expert-workflow-installed
  fi
fi
```

安装优先级：
1. **有 git** → `git clone`（Gitee → AtomGit → ZiDuNet fork → 上游 → SSH）
2. **无 git** → 下载 ZIP 解压（Gitee → ZiDuNet fork → 上游）
3. **都失败** → 搜索用户已有的 PPT skill 作为替代
4. **都没有** → **任务中止**，给出手动下载地址

### 2. 版本更新检测（可选，失败不影响使用）

> 跳过条件：本机没有 git 或网络不可达 → 静默跳过，使用当前版本。

```bash
git ls-remote https://github.com/ZiDuNet/wushuo-skills.git HEAD 2>/dev/null | awk '{print $1}' \
  || git ls-remote https://atomgit.com/hugohe3/wushuo-skills.git HEAD 2>/dev/null | awk '{print $1}' \
  || git ls-remote git@github.com:ZiDuNet/wushuo-skills.git HEAD 2>/dev/null | awk '{print $1}'
```

- 成功 → 比对本地版本，有新版本则提示用户更新
- 全部失败或无 git → **静默跳过**

---

## 依赖

**唯一依赖：**

| Skill | 安装 |
|---|---|
| ppt-master | 自动下载（优先 gitee → atomgit → ZiDuNet fork → 上游，自动同步上游最新版） |

> 无其他依赖。

---

## 核心理念

**PPT 是思考，不是设计。** 市面 99% AI PPT 工具跳过"需求调研→资料搜集"直接出结果，导致内容空洞。

本工作流模拟人类专家团队：环境检查 → 读取材料 → 需求调研 → 大纲策划 → 策划稿 → 设计稿 → 交付。

## 完整流程

> **本 skill 是 ppt-master 的前置准备层。**
> 只负责环境检查、需求调研、策划稿，然后把结果交给 ppt-master 按其自身流程执行。
> **不干预 ppt-master 的任何内部步骤**（Strategist、Executor、Export 等完全由 ppt-master 控制）。

### Step 0: 环境检查（最先执行，不可跳过）

1. **ppt-master 引擎检测与自动安装**（见上方「启动检查 → 1. ppt-master 引擎检测」）
   - 已有 → 直接使用，不干预
   - 不存在 → 自动安装
   - 安装失败 → 搜索已有 PPT skill 替代 → 都没有则中止
2. **本 skill 版本检测**（见上方「启动检查 → 2. 版本更新检测」，可选）

**环境就绪后才进入以下内容步骤。**

---

### Step 1: 预检 — 用户有无源材料？

| 情况 | 路径 |
|---|---|
| 用户给了 PDF / DOCX / MD / URL | → 用 ppt-master 的 source_to_md 脚本转换，然后走本流程 |
| 用户只给了主题/想法 | → 从 Step 2 开始，搜索 + 架构 |

---

### Step 2: 需求调研（先当顾问）

**目标**：不急着出大纲，先问清楚。

用专家工作流方法论的「顶级的PPT结构架构师」角色问三件事：
1. **为谁做？** 观众是谁？
2. **做什么？** 主题范围？核心信息？
3. **达到什么目的？** 说服？汇报？培训？展示？

工具：`web_search` 搜索背景资料。

**输出**：调研摘要（200字内），确认后再进下一步。

---

### Step 3: 大纲策划（金字塔原理）⛔ BLOCKING

> **必须等待用户确认后才能继续。** 大纲是整份 PPT 的骨架，结构错了后面全白费。

1. 结论先行：每部分以核心观点开篇
2. 以上统下：上层观点是下层内容总结
3. 归类分组：同层内容属于同一逻辑范畴
4. 逻辑递进：按逻辑顺序展开

**输出**：`<project_path>/outline.json` 或 Markdown 大纲。
**用户确认后才进入 Step 4。**

---

### Step 4: 策划稿（版面规划）★ 关键步骤 ⛔ BLOCKING

> **必须等待用户确认后才能交接给 ppt-master。** 策划稿决定每页内容，确认后改动成本高。

> 顶尖 PPT 公司（¥10,000+/页）有专门的"策划师"岗位。

对每一页定义：
- 页面标题 / 核心信息（1句话）
- 元素清单（标题/正文/图表/图片/卡片 ×N）
- 推荐布局（单一焦点 / 两栏 / 三栏 / 主次结合 / 顶部英雄式 / 混合网格）

**输出**：`<project_path>/planning_draft.md`
**用户确认后才交接给 ppt-master。**

---

### 确认策略

| 场景 | 确认方式 |
|---|---|
| 信息充分（用户给了明确主题、受众、材料） | 大纲 + 策划稿合并为**一次确认** |
| 信息模糊（缺少受众/用途/主题边界） | 大纲先确认 → 策划稿再确认，**两道关卡** |

---

### Step 5: 交接给 ppt-master（本 skill 工作结束）

将需求调研结果、大纲、策划稿作为上下文提供给 ppt-master，**由 ppt-master 接管后续全部流程**：
- ppt-master 创建项目、选择模板
- ppt-master Strategist 阶段（设计规范）
- ppt-master Executor 阶段（SVG 生成）
- ppt-master Export 阶段（PPTX 输出）

**本 skill 在此步骤之后不再参与，完全尊重 ppt-master 的工作流程。**

---

## 默认策略

1. **本 skill 只做前置准备**：环境检查 → 需求调研 → 大纲 → 策划稿，然后交接给 ppt-master
2. **不干预 ppt-master 流程**：Strategist、Executor、Export 等完全由 ppt-master 控制
3. **Bento Grid 为默认推荐**：策划稿中优先推荐卡片式布局，但最终由 ppt-master 决定
4. **先搜索后设计**：无源材料时，先 web_search 获取行业数据
5. **用户是总监，AI 是专家团队**：信息充分时不中断确认，直接推进
6. **快速通道**：受众明确时跳过八项确认：
   - 对外展示 → B) General Consulting
   - 内部汇报 → C) Top Consulting
   - 科技品牌 → 品牌主色 + 深色底 + 白
   - 数据密集型 → body 18px，无图片
   - 图标 → tabler-filled
   - 画布 → ppt169

## 参考案例

### 小米汽车对外展示PPT（2026年5月）
- 配色：小米橙 `#FF6900` + 深灰 `#1A1A2E`/`#0F0F1A`
- 字体：Microsoft YaHei，body 18px
- 布局：Bento Grid 卡片式，暗黑/浅色双版

---

## 关键词
`PPT` `专家工作流` `Bento Grid` `卡片式布局` `金字塔原理` `策划稿` `SVG` `ppt-master`
