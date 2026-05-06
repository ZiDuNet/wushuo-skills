# CLAUDE.md

## 项目说明

这是 `ZiDuNet/wushuo-skills` 仓库，武硕的 Claude Code Skills 合集。

## 提交前规则

**每次 `git commit` 之前，必须先更新根目录的 `README.md` 维基文件。**

具体要求：
1. 新增/修改/删除任何 skill 文件时，同步更新 `README.md` 中的 Skills 列表、目录结构、及相关说明
2. 确保目录结构与实际文件一致
3. 检查链接是否有效
4. **对被修改的 skill，将其 SKILL.md frontmatter 中的 `version` 末位（patch）+1**（如 `1.0.0` → `1.0.1`）。没有 version 字段则新增并设为 `1.0.0`

## Git 远程

- 远程仓库：`git@github.com:ZiDuNet/wushuo-skills.git`（SSH，HTTPS 不可用）
- 分支策略：直接推送到 master

## 语言

所有回复使用中文。代码注释使用中文，变量名保持英文。

---

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
chaoxi_common/      # 通用技能
chaoxi_screen/      # 潮汐智慧屏
_devtools/          # 内部开发工具（skill-creator 等）
ppt-expert-workflow/ # PPT 专家工作流
osszip/             # OSS 发布包（zip + SKILL.md）
tmp/                # 临时文件，不提交
```

## 命名规范

- Skill 目录名统一 `cx-` 前缀，如 `cx-wechat-article`、`cx-conference`
- 脚本文件用 kebab-case（如 `push-draft.js`）
- 版本号所有 skill 保持一致，统一递增

## 提交规范

- 不提交 `tmp/`、`.claude/`、`node_modules/`、`data/`、`.auth/` 目录
- 提交信息用中文，格式：`feat: / fix: / docs: / chore: 描述`
- 推送前确认 `.gitignore` 覆盖了不需要的文件

### 提交前安全审查（必做）

每次 `git commit` 前必须检查：

1. **密钥/凭证泄露**：扫描 diff 中是否包含 API Key、AppSecret、密码、Token、JWT、数据库连接串等敏感信息
2. **隐私数据**：确认没有用户手机号、邮箱、个人身份信息等
3. **安全漏洞**：检查代码是否存在注入、XSS、越权等 OWASP 常见漏洞
4. **配置文件**：`.env`、`credentials`、包含密钥的 `config.json` 不允许提交

**审查方式**：执行 `git diff --cached` 逐文件检查，发现敏感内容立即从暂存区移除。

---

## Skill 开发

创建或修改 skill 时，**使用 `/skill-creator`**。完整工具在 `_devtools/skill-creator/` 下，不依赖外部安装。

本项目对 skill 的额外约束：

- 目录名 `cx-` 前缀
- 版本号与其他 skill 保持一致
- Node.js 脚本零外部依赖
- CLI 输出 JSON，进度走 stderr
- 内容创作类 skill 须先输出 Markdown → 用户确认 → 再生成最终产物
- 基于潮汐会议数据的内容必须图文并茂，标注来源（"潮汐智能会议"名称不可改）

## 运行环境

- **Node.js** 18+（内置 fetch、parseArgs，ESM 支持）
- **Python** 3.10+（如需 skill-creator 的 eval 工具）
- **Git** 2.x
- **包管理**：零外部依赖原则，尽量只用内置 API
- **操作系统**：开发环境 Windows，脚本需兼容 Linux（WSL / CI）
