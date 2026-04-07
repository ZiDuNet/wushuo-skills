# Chaoxi Skills

潮汐平台 AI Agent 技能集合。当前版本：**0.0.10**

## 目录结构

```
chaoxi_skills/
├── chaoxi_common/                 # 通用技能
│   ├── cx-wechat-article/        # 微信公众号文章撰写   v0.0.10
│   ├── alt-image-parse/          # AI 图片解析          v2.0.0
│   └── alt-tools_web/            # 网络搜索与网页读取    v2.0.0
├── chaoxi_conference/             # 潮汐会议数据服务
│   └── cx-conference/            # 会议演讲数据获取      v0.0.10
├── chaoxi_screen/                 # 潮汐智慧屏
│   ├── cx-screen/                # 屏幕管理与内容投放    v1.0.0
│   ├── post-creator/             # HTML 海报生成         v2.0.0
│   └── poster-screen/            # 海报生成与投屏        v2.0.0
├── _devtools/                     # 内部开发工具（不面向终端用户）
├── osszip/                        # OSS 发布包（zip + SKILL.md）
└── tmp/                           # 临时文件（不提交）
```

## Skills

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
