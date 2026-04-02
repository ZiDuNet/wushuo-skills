# Chaoxi Skills

潮汐平台 AI Agent 技能集合。当前版本：**0.0.3**

## 目录结构

```
chaoxi_skills/
├── platforms/                    # 各平台发布类 skill
│   └── cx-wechat-article/       # 微信公众号文章撰写   v0.0.3
├── chaoxi_conference/            # 潮汐会议数据服务
│   └── cx-conference/           # 会议演讲数据获取      v0.0.3
├── _devtools/                    # 内部开发工具（不面向终端用户）
└── tmp/                          # 临时文件（不提交）
```

## Skills

### cx-wechat-article `v0.0.3`

> 微信公众号文章撰写与排版

根据主题、素材或已有内容，生成符合微信公众平台的文章。支持 5 种排版风格（classic / tech-blue / warm-orange / elegant-green / dark），自动匹配主题，输出 Markdown + 微信兼容 HTML，可选推送到草稿箱。基于潮汐会议数据的文章须图文并茂并标注来源。

**流程**：确认风格 → 生成 Markdown → 用户确认 → 渲染微信 HTML → 可选推送

### cx-conference `v0.0.3`

> 潮汐会议演讲数据获取

提供会议演讲数据（PPT 内容、演讲稿、摘要等）。登录后自动加载所有会议目录，AI 直接在上下文中联想匹配相关演讲，按需获取演讲详情。

**核心命令**：`auto`（自动加载所有会议）→ AI 联想匹配 → `use-presentation`（获取演讲详情）
