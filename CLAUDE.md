# Chaoxi Skills 项目规则

## 版本管理

每次修改任何 skill（代码、文档、主题等）时，必须同时完成：

1. **更新该 skill 的 SKILL.md 中的 `version` 字段**
2. **更新根目录 README.md** 中对应 skill 的版本号和描述
3. **所有 skill 版本号保持一致**，统一递增

## 项目结构

```
platforms/          # 各平台发布类 skill
chaoxi_conference/  # 潮汐会议数据服务
tmp/                # 临时文件，不提交
```

## 命名规范

- Skill 目录名统一 `cx.` 前缀，如 `cx.wechat-article`、`cx.conference`
- 脚本文件用 kebab-case（如 `push-draft.cjs`）
- 版本号所有 skill 保持一致，统一递增

## 提交规范

- 不提交 `tmp/`、`.claude/`、`node_modules/`、`data/`、`.auth/` 目录
- 提交信息用中文，格式：`feat: / fix: / docs: / chore: 描述`
- 推送前确认 `.gitignore` 覆盖了不需要的文件

---

## Skill 编写规范

### 目录结构

```
cx.<skill-name>/
├── SKILL.md              # 必填：skill 定义文件
├── config.json           # 按需：配置文件
├── src/                  # 按需：源代码（Node.js ESM）
├── scripts/              # 按需：脚本工具
├── themes/               # 按需：主题/风格文件
├── references/           # 按需：参考规范文档
└── data/                 # 运行时生成，不提交
```

### SKILL.md 格式

```yaml
---
name: cx.<skill-name>           # 必填：cx. 前缀
description: |                   # 必填：触发条件描述
  Use when ...
version: 0.0.3                   # 必填：与其他 skill 保持一致
metadata:                        # 按需
  openclaw:
    emoji: "📝"
    requires:
      bins: ["node"]
---
```

正文用 Markdown 写清楚：AI 执行流程、命令用法、输出格式、注意事项。

### description 触发词编写原则

- **要精确**：描述具体场景和动作，而非泛泛词汇（"会议"太泛，"获取会议演讲数据"精确）
- **要排除**：明确说明不触发的场景（如"Do NOT trigger for general meeting scheduling"）
- **给示例**：列出典型触发句式
- **避免歧义**：一个词可能有多重含义时，限定上下文

### 主题/风格文件规范（如适用）

- 每个主题文件包含完整 AI 渲染 prompt，不只是颜色表
- prompt 中给出精确 CSS 值、元素样式、兼容性要求
- 渲染流程：主题 prompt + 内容 → AI 生成最终产物

### 交互流程设计原则

- 涉及内容创作的 skill，必须先输出可编辑格式（如 Markdown）→ 用户确认后再渲染最终格式（如 HTML）
- 不可在用户未确认内容时就生成最终产物
- 基于潮汐会议数据的内容，必须图文并茂并标注来源（"潮汐智能会"名称不可改）

### 代码规范

- Node.js 脚本优先零外部依赖（使用内置 fetch、parseArgs 等）
- CLI 输出统一 JSON 格式，进度信息走 stderr（`process.stderr.write`）
- 缓存数据按 skill/data/{id}/ 结构组织，支持增量更新
- 所有命令必须支持 `--user` 参数做用户隔离
