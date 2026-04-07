---
name: alt.tools_web
version: 2.0.0
description: |
  - 当你需要进行网络关键词搜索（非指定网站）：`alt.tools_web/web_search "关键词"`
  - 当你需要读取某个 URL 的静态内容（非 SPA 前端渲染）：`alt.tools_web/web_fetch_md <url>`
  - 当你需要访问并操作指定网站（包括 SPA 前端渲染网站）：优先使用opencli工具 (`opencli list` 了解详情)。其他 browser 工具作为 fallback。
  - 当你需要动态操作网站，并在后续固化成cli指令， 你可以参考：[opencli-operate.md](docs/opencli-operate.md)

  触发词：网络搜索、关键词搜索、读取网页、读取网页文档、读取博客、search、fetch、opencli
metadata:
  openclaw:
    emoji: "🌐"
    requires:
      bins: ["defuddle", "opencli"]
      env: ["MINIMAX_CODING_KEY"]
---

## 安装依赖

- **defuddle**：`npm install -g defuddle`（web_fetch_md 依赖）
- **opencli**：通过 `opencli doctor` 检查安装状态，需 Chrome + OpenCLI Browser Bridge 扩展
