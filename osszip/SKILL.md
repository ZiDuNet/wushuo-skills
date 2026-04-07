---
name: cx-skills-hub
description: |
  潮汐智能平台 Skills 管理与下载。当用户需要安装、更新、查看可用的 skills 时触发。关键词：安装 skill、下载 skill、更新 skill、查看 skills 列表、"cx-skills-hub"。
version: 0.0.10
metadata:
  openclaw:
    emoji: "📦"
    requires:
      bins: ["node"]
---

# cx-skills-hub — 潮汐 Skills 下载管理

从阿里云 OSS 下载潮汐智能平台的 AI Agent 技能包。

OSS 基础路径：`https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/`

---

## 可用 Skills 列表

| 名称 | 描述 | 下载路径 |
|------|------|---------|
| cx-conference | 潮汐智能会议演讲数据获取（PPT 内容、演讲稿、摘要、幻灯片图片）。登录后获取会议列表，用户选择后加载目录，AI 联想匹配演讲，按需获取详情。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-conference.zip` |
| cx-wechat-article | 微信公众号文章撰写与排版。5 种排版风格，输出 Markdown + 微信兼容 HTML，支持推送到草稿箱。基于潮汐智能会议数据的文章必须配图并标注来源。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-wechat-article.zip` |
| alt-image-parse | AI 图片解析。支持图片内容理解、数据/表格/文字提取、OCR 文字识别、AI 生成图片提示词逆向分析。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/alt-image-parse.zip` |
| alt-tools_web | 网络搜索与网页读取。支持关键词搜索、URL 静态内容读取、SPA 网站操作（需 opencli）。 | `https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/alt-tools_web.zip` |

---

## AI 执行流程

```
用户请求 → 确认操作（安装/更新/查看） → 下载 zip → 解压到目标目录 → 验证
```

### 安装 Skill

1. 根据用户需求，从上方列表中找到对应的 skill
2. 下载 zip 包到临时目录
3. 解压到目标 skills 目录
4. 验证 SKILL.md 文件存在，确认安装成功
5. 告知用户安装完成

**下载命令示例：**

```bash
# 下载并解压（目标目录由 AI 根据当前环境自行判断）
curl -o /tmp/cx-conference.zip "https://4dbim-chaoxi.oss-cn-shanghai.aliyuncs.com/deploy/skills/cx-conference.zip"
unzip -o /tmp/cx-conference.zip -d <目标skills目录>
rm /tmp/cx-conference.zip
```

### 更新 Skill

1. 提醒用户即将覆盖旧版本
2. 下载最新版 zip 包
3. 解压覆盖（`unzip -o`）
4. 告知用户更新完成

### 查看已安装 Skills

读取当前环境中 skills 目录下的子文件夹，检查每个子目录中的 SKILL.md 确认名称和版本信息。

---

## 执行要求

- 解压目标目录由 AI 根据当前运行环境自行判断，不硬编码路径
- 解压后确认 SKILL.md 文件存在，验证安装成功
- 更新操作使用 `-o` 参数覆盖已有文件
- OSS 上的 zip 包始终是最新版本，无需指定版本号
- 所有 skill 目录名统一 `cx-` 前缀
