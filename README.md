# Chaoxi Skills

潮汐平台 AI Agent 技能集合。当前版本：**0.0.3**

## 目录结构

```
chaoxi_skills/
├── platforms/                    # 各平台发布类 skill
│   └── cx.wechat-article/       # 微信公众号文章撰写   v0.0.3
├── chaoxi_conference/            # 潮汐会议数据服务
│   └── cx.conference/           # 会议演讲数据获取      v0.0.3
└── tmp/                          # 临时文件（不提交）
```

## Skills

### cx.wechat-article `v0.0.3`

> 微信公众号文章撰写与排版

根据主题、素材或已有内容，生成符合微信公众平台的文章。支持 5 种排版风格（classic / tech-blue / warm-orange / elegant-green / dark），自动匹配主题，输出 Markdown + 微信兼容 HTML，可选推送到草稿箱。基于潮汐会议数据的文章须图文并茂并标注来源。

**流程**：确认风格 → 生成 Markdown → 用户确认 → 渲染微信 HTML → 可选推送

### cx.conference `v0.0.3`

> 潮汐会议演讲数据获取

提供会议演讲数据（PPT 内容、演讲稿、摘要等）。登录后自动加载所有会议目录，支持跨会议关键词搜索（`search`），按需获取演讲详情。

**核心命令**：`auto`（自动加载所有会议）→ `search`（关键词搜索）→ `use-presentation`（获取演讲详情）

---

## Skill 编写规范

### 目录结构要求

每个 skill 必须遵循以下目录结构：

```
cx.<skill-name>/
├── SKILL.md              # 必填：skill 定义文件（YAML frontmatter + 文档）
├── config.json           # 按需：配置文件
├── src/                  # 按需：源代码
├── scripts/              # 按需：脚本工具
├── themes/               # 按需：主题/风格文件
├── references/           # 按需：参考规范文档
└── data/                 # 运行时生成，不提交
```

### SKILL.md 格式

```yaml
---
name: cx.<skill-name>           # 必填：cx. 前缀
description: |                   # 必填：触发条件描述，要精确避免误触发
  Use when ...
version: 0.0.3                   # 必填：语义化版本号
metadata:                        # 按需
  openclaw:
    emoji: "📝"
    requires:
      bins: ["node"]
---

# cx.<skill-name> — 简短描述

具体使用说明和执行流程...
```

### 命名规范

- Skill 目录名统一 `cx.` 前缀（如 `cx.wechat-article`、`cx.conference`）
- 脚本文件用 kebab-case（如 `push-draft.cjs`、`cx-conference`）
- 版本号所有 skill 保持一致，统一递增

### 版本管理规则

**每次修改任何 skill，必须同步完成以下三步：**

1. 更新该 skill 的 `SKILL.md` 中的 `version` 字段
2. 更新 `README.md` 中对应 skill 的版本号和描述
3. 所有 skill 版本号保持一致，统一递增

### 提交规范

- 不提交 `tmp/`、`.claude/`、`node_modules/`、`data/`、`.auth/` 目录
- 提交信息用中文，格式：`feat: / fix: / docs: / chore: 描述`
- 推送前确认 `.gitignore` 覆盖了不需要的文件

### description 触发词编写原则

- **要精确**：描述具体场景和动作，而非泛泛的词汇
- **要排除**：明确说明不触发的场景（如"不要在日常开会讨论时触发"）
- **给示例**：列出典型的触发句式
- **避免歧义**：一个词可能有多重含义时，限定上下文

### 主题/风格文件规范（如适用）

- 每个主题文件包含完整 AI 渲染 prompt（不只是颜色表）
- prompt 中给出精确的 CSS 值、元素样式、兼容性要求
- 渲染流程：主题 prompt + 内容 → AI 生成最终产物
