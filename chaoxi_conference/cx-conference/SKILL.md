---
name: cx-conference
description: |
  当用户需要获取潮汐智能会议的演讲数据（PPT 内容、演讲稿、摘要、幻灯片图片）时触发。关键词：演讲、PPT、演讲稿、会议数据、"cx-conference"、"潮汐智能会议"。不触发：普通会议安排或讨论。
version: 0.0.6
metadata:
  openclaw:
    emoji: "🎥"
    requires:
      bins: ["node"]
---

# cx-conference — 会议数据源

提供会议演讲数据（PPT 内容、演讲稿、摘要等），支持多用户隔离。**先获取会议列表让用户选择，按需加载目录数据**。

---

## 推荐用法：auto → 用户选择会议 → load-catalog → AI 联想匹配 → use-presentation

### 1. auto — 快速获取会议列表

```
node {skill-folder}/src/cli.js auto --user <id>
```

**返回值中的 `step` 字段：**

| step | 含义 | AI 应该做的 |
|------|------|------------|
| `needLogin` | 未登录或登录过期 | 问用户手机号 → login → 问验证码 → verify → 重新 auto |
| `noConference` | 没有可用会议 | 告知用户 |
| `selectConference` | 会议列表已获取 | **展示会议列表让用户选择** |

auto 只拉取会议名称列表（轻量，秒回），**不会加载演讲目录**，不会让用户等待。

**AI 应该这样处理 `selectConference`：**
1. 将 `conferences` 列表展示给用户
2. 问用户："您想查看哪个会议的数据？也可以选择全部加载。"
3. 根据用户选择执行 `load-catalog`

### 2. load-catalog — 加载会议目录

```
# 加载指定会议
node {skill-folder}/src/cli.js load-catalog --conf <confId> --user <id>

# 加载全部会议
node {skill-folder}/src/cli.js load-catalog --all --user <id>

# 强制刷新缓存
node {skill-folder}/src/cli.js load-catalog --all --refresh --user <id>
```

**返回值中的 `step` 字段：**

| step | 含义 | AI 应该做的 |
|------|------|------------|
| `ready` | 会议目录已加载 | 浏览 presentations，AI 联想匹配相关演讲 |

**执行 load-catalog 前，告知用户：**"正在加载会议数据，请稍候..."。stderr 会输出每个会议的加载进度。

**如何找到相关演讲：** `load-catalog` 返回的 `conferences[].presentations[]` 包含所有演讲的 `title`、`abstract`、`speakerName` 等字段。AI 直接在上下文中浏览这些数据，用自己的理解能力联想匹配即可（如用户说"贵金属"，AI 可以匹配到标题含"铂"、"钯"、"铑"的演讲），不需要额外搜索命令。匹配到合适的 `objectId` 后，用 `use-presentation` 获取详情。

### 3. use-presentation — 查看演讲详情

```
node {skill-folder}/src/cli.js use-presentation <presId> --conf <confId> --user <id>
```

- `--conf` 指定会议 ID（从 load-catalog 返回的数据中获取）
- 如果 presId 在所有会议中唯一，可省略 `--conf`

---

## 完整流程示例

```
# 1. 获取会议列表（秒回）
node {skill-folder}/src/cli.js auto --user alice
→ { step: "selectConference",
    conferences: [
      { conferenceId: "conf_abc", conferenceName: "2024春季金属峰会" },
      { conferenceId: "conf_def", conferenceName: "2024秋季新能源大会" },
      { conferenceId: "conf_ghi", conferenceName: "2025贵金属年会" }
    ] }

# 2. AI 将列表展示给用户，用户选择 "2024春季金属峰会"
# 3. 加载该会议目录
node {skill-folder}/src/cli.js load-catalog --conf conf_abc --user alice
→ { step: "ready", conferences: [{
      conferenceName: "2024春季金属峰会",
      presentations: [{ objectId: "pres_123", title: "钨金属材料发展趋势", ... }]
    }] }

# 4. AI 在返回数据中直接匹配到"钨金属材料发展趋势"，→ 获取详情
node {skill-folder}/src/cli.js use-presentation pres_123 --conf conf_abc --user alice
→ { ok: true, hasContent: true, hasScript: true, validatedImages: [...] }

# 5. AI 基于演讲数据生成文章
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

**文件说明：**

| 文件 | 格式 | 内容 | AI 用途 |
|------|------|------|---------|
| `intro.yaml` | YAML | 每页幻灯片的元数据：标题（`title`）、备注（`note`）、图片链接（`imageUrl`） | **配图来源**：`imageUrl` 是文章配图的唯一来源，每页幻灯片一张图 |
| `content.txt` | 纯文本 | 逐页提取的 PPT 文字内容，每页以分隔线隔开 | **文章素材**：PPT 上的核心文字、要点、数据 |
| `script.txt` | 纯文本 | 演讲者的逐字稿/演讲稿 | **文章素材**：口语化的演讲内容，用于整理文章时参考 |
| `summary.txt` | 纯文本 | 演讲的总结摘要 | **文章素材**：提炼核心观点，用于文章框架和要点 |

**缓存策略：**
- `load-catalog` 首次执行时缓存会议的 catalog
- 进行中的会议：只缓存 catalog，演讲详情按需下载
- 已结束的会议：首次加载时自动下载全部演讲详情
- `--refresh` 强制重新从 API 拉取并覆盖本地缓存
- AI 联想匹配直接在 load-catalog 返回的数据上进行，不触发额外下载

**其他存储：**
- `{skill-folder}/.auth/{userId}.json` — 用户 token（含 JWT、手机号、过期时间）

---

## 执行要求

- **工作目录**：在用户当前工作目录执行，不要 cd 到 skill 目录
- **`--user` 参数**：所有命令必填，标识调用者身份
- **token 过期**：auto 返回 `needLogin` 时引导用户重新登录
- **搜索策略**：用户提到具体主题时，AI 直接在 load-catalog 返回的数据中联想匹配，不要局限于当前绑定的会议
