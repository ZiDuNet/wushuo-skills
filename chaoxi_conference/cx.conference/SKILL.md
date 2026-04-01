---
name: cx.conference
description: |
  Use when user needs to fetch presentation data (slides, scripts, summaries) from 潮汐 conference platform. Triggers on: accessing conference speech content, downloading PPT/演讲稿, listing presentations, or explicitly mentions "cx.conference" / "潮汐". Do NOT trigger for general meeting scheduling or discussion.
version: 0.0.3
metadata:
  openclaw:
    emoji: "🎥"
    requires:
      bins: ["node"]
---

# cx.conference — 会议数据源

提供会议演讲数据（PPT 内容、演讲稿、摘要等），支持多用户隔离，**自动加载所有会议，AI 直接联想匹配相关演讲**。

---

## 推荐用法：auto → AI 联想匹配 → use-presentation

### 1. auto — 自动加载所有会议

```
{skill-folder}/cx-conference auto --user <id>
```

**返回值中的 `step` 字段：**

| step | 含义 | AI 应该做的 |
|------|------|------------|
| `needLogin` | 未登录或登录过期 | 问用户手机号 → login → 问验证码 → verify → 重新 auto |
| `noConference` | 没有可用会议 | 告知用户 |
| `ready` | 所有会议数据已就绪 | 浏览 presentations 列表，AI 联想匹配相关演讲 |

**特殊选项：**
- `--refresh` 强制刷新所有缓存：`auto --refresh --user <id>`

auto 会自动拉取用户可访问的**所有会议**目录并缓存，无需手动绑定。

**执行 auto 前，先告知用户：**"正在获取会议数据，请稍候..."。返回结果中的 `loadingLog` 字段包含每个会议的加载状态，可展示给用户。

**如何找到相关演讲：** `auto` 返回的 `conferences[].presentations[]` 包含所有演讲的 `title`、`abstract`、`speakerName` 等字段。AI 直接在上下文中浏览这些数据，用自己的理解能力联想匹配即可（如用户说"贵金属"，AI 可以匹配到标题含"铂"、"钯"、"铑"的演讲），不需要额外搜索命令。匹配到合适的 `objectId` 后，用 `use-presentation` 获取详情。

### 2. use-presentation — 查看演讲详情

```
{skill-folder}/cx-conference use-presentation <presId> --conf <confId> --user <id>
```

- `--conf` 指定会议 ID（从 auto 返回的数据中获取）
- 如果 presId 在所有会议中唯一，可省略 `--conf`

---

## 完整流程示例

```
# 首次使用，登录
{skill-folder}/cx-conference auto --user alice
→ { step: "needLogin", ... }

# 登录后重新 auto，加载所有会议
{skill-folder}/cx-conference auto --user alice
→ { step: "ready", totalConferences: 3, totalPresentations: 87,
    conferences: [{
      conferenceName: "2024春季金属峰会",
      presentations: [{ objectId: "pres_123", title: "钨金属材料发展趋势", ... }]
    }, ...] }

# AI 在返回数据中直接匹配到"钨金属材料发展趋势"，→ 获取详情
{skill-folder}/cx-conference use-presentation pres_123 --conf conf_abc --user alice
→ { ok: true, hasContent: true, hasScript: true, validatedImages: [...] }

# AI 基于演讲数据生成文章
```

---

## 其他命令

| 命令 | 说明 |
|------|------|
| `check --user <id>` | 检查登录状态 |
| `me --user <id>` | 查看用户信息 |
| `logout --user <id>` | 登出 |
| `list-conference --user <id>` | 列出可用会议 |
| `bind-conference <confId> --user <id>` | 手动绑定会议（可选，auto 已自动加载所有会议） |

---

## 缓存结构

所有缓存数据存储在 `{skill-folder}/data/{conferenceId}/` 下：

```
data/{conferenceId}/
├── catalog.json          # 会议目录（全部演讲的元数据列表）
├── cache-meta.json       # 缓存元信息（加载时间、是否进行中、下载状态）
└── {presentationId}/     # 每个演讲的详情数据
    ├── intro.yaml        # 幻灯片级元数据（每页标题、备注、图片链接）
    ├── content.txt       # 逐页 PPT 文字内容
    ├── script.txt        # 演讲稿/逐字稿
    └── summary.txt       # 演讲总结
```

**缓存策略：**
- `auto` 首次执行时自动缓存所有会议的 catalog
- 进行中的会议：只缓存 catalog，演讲详情按需下载
- 已结束的会议：首次加载时自动下载全部演讲详情
- `--refresh` 强制重新从 API 拉取并覆盖本地缓存
- AI 联想匹配直接在 auto 返回的数据上进行，不触发额外下载

**其他存储：**
- `{skill-folder}/.auth/{userId}.json` — 用户 token（含 JWT、手机号、过期时间）

---

## 执行要求

- **工作目录**：在用户当前工作目录执行，不要 cd 到 skill 目录
- **`--user` 参数**：所有命令必填，标识调用者身份
- **token 过期**：auto 返回 `needLogin` 时引导用户重新登录
- **搜索策略**：用户提到具体主题时，AI 直接在 auto 返回的数据中联想匹配，不要局限于当前绑定的会议
