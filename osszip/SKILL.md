---
name: cx-skills-hub
description: |
  潮汐智能平台 skills 管理与下载。当用户需要安装、更新、查看可用的 skills 时触发。关键词：安装 skill、下载 skill、更新 skill、查看 skills 列表、"cx-skills-hub"。
version: 0.0.11
metadata:
  openclaw:
    emoji: "📦"
    requires:
      bins: ["node"]
---

# cx-skills-hub — 潮汐 skills 下载管理

从阿里云 OSS 下载潮汐智能平台的 AI Agent 技能包。

OSS 基础路径：`https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/`

---

## 可用 skills 列表

| 名称 | 描述 | 下载路径 |
|------|------|---------|
| cx-conference | 潮汐智能会议演讲数据获取（PPT 内容、演讲稿、摘要、幻灯片图片）。登录后获取会议列表，用户选择后加载目录，AI 联想匹配演讲，按需获取详情。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-conference.zip` |
| cx-wechat-article | 微信公众号文章撰写与排版。5 种排版风格，输出 Markdown + 微信兼容 HTML，支持推送到草稿箱。基于潮汐智能会议数据的文章必须配图并标注来源。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-wechat-article.zip` |
| alt-image-parse | AI 图片解析。支持图片内容理解、数据/表格/文字提取、OCR 文字识别、AI 生成图片提示词逆向分析。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/alt-image-parse.zip` |
| alt-tools_web | 网络搜索与网页读取。支持关键词搜索、URL 静态内容读取、SPA 网站操作（需 opencli）。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/alt-tools_web.zip` |
| cx-screen | 潮汐智慧屏管理。短信验证码登录，屏幕绑定与内容投放（图片、HTML），支持多用户。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-screen.zip` |
| post-creator | 单页 HTML 海报生成。支持横屏 16:9 / 竖屏 9:16 比例，多种风格（现代、极简、复古、中国风、科技等）。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/post-creator.zip` |
| poster-screen | 海报生成与智慧屏投放。上传素材（PDF/PPT/图片/文字），按屏幕方向生成海报，确认后投放至潮汐智慧屏。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/poster-screen.zip` |

---

## 前置依赖

部分 skill 需要额外安装第三方 skill，使用 `clawhub` 安装：

```bash
# 安装 clawhub（如未安装）
npm i -g clawhub

# 按需安装依赖 skill
clawhub install feishu-doc          # 飞书文档读取
clawhub install find-skills         # skill 搜索发现
clawhub install playwright-scraper  # 网页抓取（poster-screen 依赖）
npm install -g agent-browser
agent-browser install --with-deps
sudo npm install -g defuddle
npm install -g @jackwener/opencli
npm install -g bun --registry=https://registry.npmmirror.com`

```

> 具体依赖见各 skill 的 SKILL.md 中 `requires` 字段。

---

## AI 执行流程

```
用户请求 → 确认操作（安装/更新/查看） → 下载 zip → 解压到目标目录 → 验证
```

### 安装 Skill

1. 根据用户需求，从上方列表中找到对应的 skill
2. 下载 zip 包到临时目录
3. 解压到你的工作区 skills 目录
4. 验证 SKILL.md 文件存在，确认安装成功
5. 告知用户安装完成

**下载命令示例：**

```bash
# 下载并解压（解压到工作区skills 目录）
curl -o /tmp/cx-conference.zip "https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-conference.zip"
unzip -o /tmp/cx-conference.zip -d <你的工作区skills目录>
rm /tmp/cx-conference.zip
```

### 更新 Skill

1. 提醒用户即将覆盖旧版本
2. 下载最新版 zip 包
3. 解压覆盖（`unzip -o`）
4. 告知用户更新完成

### 查看已安装 skills

读取当前环境中 skills 目录下的子文件夹，检查每个子目录中的 SKILL.md 确认名称和版本信息。

---

## 执行要求

- 解压目标目录由 AI 根据当前运行环境自行判断，不硬编码路径
- 解压后确认 SKILL.md 文件存在，验证安装成功
- 更新操作使用 `-o` 参数覆盖已有文件
- OSS 上的 zip 包始终是最新版本，无需指定版本号
- 所有 skill 目录名统一 `cx-` 前缀
