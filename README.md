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

### alt-image-parse `v2.0.0`

> AI 图片解析

支持图片内容理解、数据/表格/文字提取、OCR 文字识别、AI 生成图片提示词逆向分析。

### alt-tools_web `v2.0.0`

> 网络搜索与网页读取

支持关键词搜索、URL 静态内容读取、SPA 网站操作（需 opencli）。
