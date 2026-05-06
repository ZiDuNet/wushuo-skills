# wushuo-skills

武硕的 Claude Code Skills 合集。

## Skills 列表

| Skill | 版本 | 说明 | 状态 |
|---|---|---|---|
| [ppt-expert-workflow](chaoxi_工具类/ppt-expert-workflow/SKILL.md) | v1.0.4 | PPT 专家工作流：前置准备层，需求调研 → 策划稿 → 交接给 ppt-master | ✅ 可用 |
| cx-conference | v0.0.10 | 会议演讲数据获取 | ✅ 可用 |
| cx-wechat-article | v0.0.10 | 微信公众号文章撰写与排版 | ✅ 可用 |
| cx-screen | v1.0.0 | 潮汐智慧屏管理 | ✅ 可用 |
| post-creator | v2.0.0 | HTML 海报生成 | ✅ 可用 |
| poster-screen | v2.0.0 | 海报生成与智慧屏投放 | ✅ 可用 |
| alt-image-parse | v2.0.0 | AI 图片解析 | ✅ 可用 |
| alt-tools_web | v2.0.0 | 网络搜索与网页读取 | ✅ 可用 |
| [cx-ai-empower-plan](chaoxi_培训类/cx-ai-course-recommendation/SKILL.md) | v0.4.0 | AI赋能方案生成（5种场景宣传材料） | ✅ 可用 |

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
- **ppt-master**（必装）— 核心引擎，自动从 [ZiDuNet/ppt-master](https://github.com/ZiDuNet/ppt-master) fork 安装，通过 Actions 每日同步上游

详见 [ppt-expert-workflow/SKILL.md](chaoxi_工具类/ppt-expert-workflow/SKILL.md)。

## Chaoxi Skills 概述

潮汐平台 AI Agent 技能集合。当前版本：**0.0.10**

### cx-conference `v0.0.10`

> 潮汐会议演讲数据获取

提供会议演讲数据（PPT 内容、演讲稿、摘要等）。登录后先获取会议列表让用户选择，按需加载目录，AI 在上下文中联想匹配相关演讲。

**核心命令**：`auto`（获取会议列表）→ 用户选择 → `load-catalog`（加载目录）→ AI 联想匹配 → `use-presentation`（获取演讲详情）

### cx-wechat-article `v0.0.10`

> 微信公众号文章撰写与排版

根据主题、素材或已有内容，生成符合微信公众平台的文章。支持 5 种排版风格（classic / tech-blue / warm-orange / elegant-green / dark），自动匹配主题，输出 Markdown + 微信兼容 HTML，可选推送到草稿箱。基于潮汐会议数据的文章须图文并茂并标注来源。

**流程**：确认风格 → 确定标题 → 生成 Markdown → 用户确认 → 渲染微信 HTML → 可选推送

### cx-screen `v1.0.0`

> 潮汐智慧屏管理

短信验证码登录，屏幕绑定与内容投放（图片、HTML），支持多用户。

### post-creator `v2.0.0`

> HTML 海报生成

生成精美单页 HTML 海报。支持横屏 16:9 / 竖屏 9:16 比例，多种风格（现代、极简、复古、中国风、科技等）。

### poster-screen `v2.0.0`

> 海报生成与智慧屏投放

上传素材（PDF/PPT/图片/文字），按已绑定屏幕方向生成对应比例海报（横屏 16:9 或竖屏 9:16），截图预览确认后投放至潮汐智慧屏。

### alt-image-parse `v2.0.0`

> AI 图片解析

支持图片内容理解、数据/表格/文字提取、OCR 文字识别、AI 生成图片提示词逆向分析。

### alt-tools_web `v2.0.0`

> 网络搜索与网页读取

支持关键词搜索、URL 静态内容读取、SPA 网站操作（需 opencli）。

### cx-ai-empower-plan `v0.4.0`

> AI赋能方案生成

根据场景自动生成AI企业赋能宣传材料。支持5种场景：泛销售介绍（L1）、行业/企业方案（L2）、企业内部深度方案（L3）、渠道合作贴牌（L4）、学校合作（L5）。输出格式包括HTML、PDF、PPT、海报等。

## 目录结构

```
wushuo-skills/
├── README.md                          # 本文件（维基）
├── CLAUDE.md                          # Claude Code 项目指令
├── .claude/
│   └── settings.local.json            # 项目权限配置
├── .github/
│   └── workflows/
│       └── sync-ppt-master-fork.yml   # 定时同步 ppt-master fork
├── chaoxi_工具类/                      # 潮汐工具类
│   └── ppt-expert-workflow/            # PPT 专家工作流
│       └── SKILL.md                    # PPT 专家工作流定义
├── chaoxi_培训类/                      # 潮汐培训类
│   └── cx-ai-course-recommendation/    # AI赋能方案生成
│       └── SKILL.md                    # 赋能方案 Skill 定义
├── chaoxi_common/                     # 通用技能
│   ├── cx-wechat-article/             # 微信公众号文章撰写
│   ├── alt-image-parse/               # AI 图片解析
│   └── alt-tools_web/                 # 网络搜索与网页读取
├── chaoxi_conference/                 # 潮汐会议数据服务
│   └── cx-conference/                 # 会议演讲数据获取
├── chaoxi_screen/                     # 潮汐智慧屏
│   ├── cx-screen/                     # 屏幕管理与内容投放
│   ├── post-creator/                  # HTML 海报生成
│   └── poster-screen/                 # 海报生成与投屏
├── _devtools/                         # 内部开发工具（不面向终端用户）
├── osszip/                            # OSS 发布包（zip + SKILL.md）
└── tmp/                               # 临时文件（不提交）
```

## 安装

将仓库 clone 到 Claude Code 的 skills 目录即可：

```bash
git clone git@github.com:ZiDuNet/wushuo-skills.git
```
