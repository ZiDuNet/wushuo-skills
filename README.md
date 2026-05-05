# wushuo-skills

武硕的 Claude Code Skills 合集。

## Skills 列表

| Skill | 版本 | 说明 | 状态 |
|---|---|---|---|
| [ppt-expert-workflow](ppt-expert-workflow/SKILL.md) | v1.0.1 | PPT 专家工作流：需求调研 → 资料检索 → 策划稿 → 卡片式 SVG 设计 → PPTX 输出 | ✅ 可用 |

## ppt-expert-workflow 概述

整合 DrawBookAI 四步专家工作流 + ppt-master SVG→PPTX 管线。

**核心理念**：PPT 是思考，不是设计。模拟人类专家团队流程，而非直接出结果。

**5 步流程**：
1. **需求调研** — 先当顾问，问清受众/主题/目的
2. **大纲策划** — 金字塔原理，结论先行
3. **策划稿** — 版面规划（不是设计），定义每页元素和布局
4. **设计稿** — Bento Grid 卡片式 SVG 生成
5. **输出交付** — SVG 后处理 → PPTX 导出

**依赖关系**：
- **ppt-master**（必装）— 核心引擎，SVG 生成 + PPTX 导出
- guizang-ppt-skill、html-ppt-skill、gpt-image2-ppt、huashu-slides（可选）

详见 [ppt-expert-workflow/SKILL.md](ppt-expert-workflow/SKILL.md)。

## 目录结构

```
wushuo-skills/
├── README.md                      # 本文件（维基）
├── CLAUDE.md                      # Claude Code 项目指令
├── .claude/
│   └── settings.local.json        # 项目权限配置
└── ppt-expert-workflow/
    └── SKILL.md                   # PPT 专家工作流定义
```

## 安装

将仓库 clone 到 Claude Code 的 skills 目录即可：

```bash
git clone git@github.com:ZiDuNet/wushuo-skills.git
```
