---
name: cx.screen
description: |
  潮汐屏幕技能。短信验证码登录，支持多用户，屏幕绑定与内容投放。

  **什么时候使用**：
  - 用户要求使用 cx.screen 相关功能
  - 用户提到"潮汐"、"屏幕"、"cx.screen"、投放图片、投放 HTML、屏幕快照

  **前置条件**：用户先完成登录认证并绑定屏幕，才能使用投放功能。

version: 1.0.0
metadata:
  openclaw:
    emoji: "📱"
    requires:
      bins: ["node"]
---

# cx.screen — 认证与屏幕管理

通过短信验证码登录，绑定屏幕后可投放图片/HTML、查询快照。支持多用户，按调用者 ID 隔离。

---

## CLI 路径

```
{skill}/cx-screen
```

实际路径（当前 workspace）：
```
/home/linaro/.copaw/workspaces/default/skills/cx.screen/cx-screen
```

执行器：`node cli.js`（Node.js ESM 模式，无需 tsx）

---

## 命令总览

| 命令 | 前置条件 | 说明 |
|------|---------|------|
| `check --user <id>` | 无 | 检查登录状态 |
| `login --user <id> --mobile <phone>` | 无 | 发送短信验证码 |
| `verify --user <id> --code <code>` | login | 验证码登录 |
| `me --user <id>` | 无 | 查看用户信息 |
| `logout --user <id>` | 无 | 登出 |
| `list-screen --user <id>` | login | 列出可用屏幕 |
| `bind-screen <screenId> --user <id>` | login | 绑定屏幕 |
| `play-image <filePath> --user <id>` | 已绑定屏幕 | 投放图片 |
| `play-html <filePath> --user <id>` | 已绑定屏幕 | 投放 HTML |
| `screenshot --user <id>` | 已绑定屏幕 | 查询屏幕快照 |

**`--user` 参数**：必填。当前固定用户为 `default`。

---

## 执行方式

所有命令使用相对 skill 目录的路径执行：

```bash
# 完整路径
{skill}/cx-screen <command> [args]

# 例：检查登录状态
/home/linaro/.copaw/workspaces/default/skills/cx.screen/cx-screen check --user default

# 例：投图片（已绑定屏幕时直接用）
/home/linaro/.copaw/workspaces/default/skills/cx.screen/cx-screen play-image /path/to/image.png --user default
```

---

## 完整交互流程（首次使用）

```
1. 检查登录状态
   {skill}/cx-screen check --user <id>
   ├─ loggedIn: true, expired: false → 已登录，跳到第3步
   └─ 未登录/过期 → 进入登录流程

2. 登录
   a. 询问用户手机号
   b. {skill}/cx-screen login --user <id> --mobile <手机号>
   c. 询问用户收到的6位验证码
   d. {skill}/cx-screen verify --user <id> --code <验证码>

3. 查询并绑定屏幕
   a. {skill}/cx-screen list-screen --user <id>
      → 返回屏幕列表，让用户选择
   b. {skill}/cx-screen bind-screen <screenId> --user <id>
```

---

## 各命令返回示例

### check
```json
{
  "ok": true,
  "loggedIn": true,
  "expired": false,
  "mobile": "183****9996",
  "userId": "17xTSqYhPn1zF0op"
}
```

### login
```json
{ "ok": true, "message": "验证码已发送" }
```

### verify
```json
{ "ok": true, "message": "登录成功", "jwt": "eyJ..." }
```

### list-screen
```json
{
  "ok": true,
  "screens": [
    { "screenId": "e808dc48ab3afd42", "name": "屏幕1", "status": "online" }
  ]
}
```

### play-image
```json
{ "ok": true, "message": "图片投放成功", "screenId": "xxxxxx" }
```

### play-html
```json
{ "ok": true, "message": "HTML投放成功", "screenId": "xxxxx" }
```

### screenshot
返回 base64 编码的 PNG 图片数据。

---

## 存储文件

| 文件 | 路径 | 说明 |
|------|------|------|
| token | `{skill}/.auth/<user>.json` | JWT 登录凭证 |
| 屏幕绑定 | `{skill}/.auth/<user>.bind.json` | 已绑定的屏幕 ID 及横竖屏信息 |

### 屏幕绑定文件 (.bind.json)

绑定屏幕后，绑定信息保存在 `{skill}/.auth/<user>.bind.json`，包含：

```json
{
  "screenId": "e808dc48ab3afd42",
  "direction": "竖屏",
  "boundAt": 1775212339698
}
```

| 字段 | 说明 |
|------|------|
| screenId | 屏幕 SN（设备序列号） |
| direction | 屏幕方向：`竖屏` 或 `横屏` |
| boundAt | 绑定时间戳（毫秒） |

**查看当前绑定：**
```bash
cat {skill}/.auth/default.bind.json
```

---

## 常见问题

**Q: 报 `Cannot find module` 或 `import.meta.dir` 错误？**
A: 确保用 Node.js 18+ 运行，CLI 已内置 ESM 兼容逻辑。

**Q: token 过期了？**
A: `check` 返回 `expired: true`，重新执行 `login` → `verify`。

**Q: 需要更换用户？**
A: 换一个新的 `--user <id>` 即可，token 和绑定按用户 ID 隔离存储。

**Q: 屏幕 ID 从哪来？**
A: `list-screen` 返回的 `screenId` 字段。
