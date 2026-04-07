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
_devtools/          # 内部开发工具（skill-creator 等）
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
