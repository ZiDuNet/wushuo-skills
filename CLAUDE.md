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

## 提交规范

- 不提交 `tmp/`、`.claude/`、`node_modules/` 目录
- 提交信息用中文，格式：`feat: / fix: / docs: / chore: 描述`
- 推送前确认 `.gitignore` 覆盖了不需要的文件
