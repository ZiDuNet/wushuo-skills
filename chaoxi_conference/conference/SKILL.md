---
name: cx.conference
description: |
  Use when user mentions "超息", "会议", "cx.conference", or needs conference/presentation data including slides, scripts, and summaries.
version: 1.1.0
metadata:
  openclaw:
    emoji: "🎥"
    requires:
      bins: ["node"]
---

# cx.conference — 会议数据源

提供会议演讲数据（PPT 内容、演讲稿、摘要等），支持多用户隔离。

---

## 推荐用法：auto 命令

一条命令自动检测状态，返回 `step` 字段告诉 AI 下一步做什么：

```
{skill-folder}/cx-conference auto --user <id>
```

**返回值中的 `step` 字段：**

| step | 含义 | AI 应该做的 |
|------|------|------------|
| `needLogin` | 未登录或登录过期 | 问用户手机号 → login → 问验证码 → verify → 重新 auto |
| `needBind` | 未绑定会议 | 展示会议列表让用户选择 → bind-conference → 重新 auto |
| `ready` | 数据已就绪 | 直接使用 `presentations` 数组 |

**特殊选项：**
- `--rebind` 换绑会议：`auto --rebind --user <id>`
- `--refresh` 强制刷新缓存：`auto --refresh --user <id>`

---

## 完整流程示例

```
第 1 次调用 auto:
  {skill-folder}/cx-conference auto --user alice
  → { step: "needLogin", message: "未登录", next: [...] }

  AI: "请输入手机号"
  用户: 13800138000

  {skill-folder}/cx-conference login --user alice --mobile 13800138000
  → { ok: true, message: "验证码已发送至 138****8000" }

  AI: "请输入收到的6位验证码"
  用户: 123456

  {skill-folder}/cx-conference verify --user alice --code 123456
  → { ok: true, message: "登录成功" }

第 2 次调用 auto:
  {skill-folder}/cx-conference auto --user alice
  → { step: "ready", presentations: [...] }

  ✅ 数据到手，AI 直接使用
```

---

## 查看演讲详情

```
{skill-folder}/cx-conference use-presentation <presId> --user <id>
```

返回演讲的 PPT 内容、演讲稿、摘要等（按需下载，首次会自动缓存）。

---

## 其他命令

| 命令 | 说明 |
|------|------|
| `check --user <id>` | 检查登录状态 |
| `me --user <id>` | 查看用户信息 |
| `logout --user <id>` | 登出 |
| `list-conference --user <id>` | 列出可用会议 |
| `bind-conference <confId> --user <id>` | 手动绑定会议 |

---

## 执行要求

- **工作目录**：在用户当前工作目录执行，不要 cd 到 skill 目录
- **`--user` 参数**：所有命令必填，标识调用者身份
- **token 过期**：auto 返回 `needLogin` 时引导用户重新登录
