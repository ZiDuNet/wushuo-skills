# 科技蓝主题
name: tech-blue
type: ai
description: "【科技蓝】现代科技感，理性专业，适合技术和产品内容"
version: "1.0"

# 风格说明
style_info:
  mood: "现代科技"
  colors: "蓝色调"
  best_for: "科技资讯、产品评测、技术教程、互联网行业"

# 颜色方案
colors:
  background: "#ffffff"
  text: "#333333"
  primary: "#0d6efd"
  secondary: "#0b5ed7"
  heading: "#0d1b2a"
  quote_background: "#f0f4f8"
  code_background: "#f0f4f8"
  tip_background: "#e8f0fe"
  tip_border: "#0d6efd"

# AI 提示词模板
prompt: |
  【指令 V1.0】科技蓝现代风格网页设计提示词

  指令：
  你是一位专业的网页设计师，对微信公众号编辑器的兼容性有深刻理解。根据以下风格指南，将 Markdown 内容转换为纯内联样式的微信 HTML。

  核心风格：现代、科技、专业，蓝色为主强调色。

  第一部分：技术要求

  【关键】结构：
  - 在内容外层包裹一个主 <div>，全局样式应用在此，而非 <body>
  - 主容器 padding: 20px 0，max-width: 677px，margin: 0 auto
  - 所有样式必须纯内联，禁止 <style> 标签和 class

  【关键】文字颜色保护：
  - 每个 <p> 标签必须显式添加 color: #333333;，防止微信重置为黑色

  第二部分：配色

  - 背景: #ffffff
  - 正文: #333333
  - 标题: #0d1b2a
  - 强调色: #0d6efd（用于左边框、链接、代码块边框）
  - 引用背景: #f0f4f8
  - 引用左边框: #0d6efd

  第三部分：元素样式

  一级标题 (<h2>)：
  - font-size: 20px; font-weight: bold; color: #0d1b2a;
  - border-left: 4px solid #0d6efd; padding-left: 12px;
  - margin: 32px 0 16px;

  二级标题 (<h3>)：
  - font-size: 17px; font-weight: bold; color: #0d1b2a;
  - border-bottom: 2px solid #0d6efd; display: inline-block;
  - margin: 24px 0 12px;

  正文 (<p>)：
  - font-size: 16px; line-height: 1.8; color: #333333;
  - margin-bottom: 16px; text-align: justify;

  加粗 (<strong>)：
  - font-weight: bold; color: #0d6efd;

  行内代码 (<code>)：
  - background: #f0f4f8; padding: 2px 6px; border-radius: 3px;
  - font-family: monospace; font-size: 14px; color: #0d6efd;

  引用 (<blockquote>)：
  - background: #f0f4f8; border-left: 4px solid #0d6efd;
  - padding: 14px 16px; margin: 20px 0;
  - color: #555; font-size: 15px; border-radius: 0 4px 4px 0;

  图片 (<img>)：
  - width: 100%; display: block; border-radius: 4px;
  - margin: 20px 0;

  代码块 (<pre>)：
  - background: #f0f4f8; padding: 16px; border-radius: 4px;
  - border-left: 3px solid #0d6efd;
  - font-family: monospace; font-size: 14px; line-height: 1.6;
  - overflow-x: auto; white-space: pre-wrap;

  表格 (<table>)：
  - width: 100%; border-collapse: collapse; font-size: 15px;
  - th: background: #f0f4f8; font-weight: bold; color: #0d1b2a;
  - td, th: padding: 10px 14px; border: 1px solid #e3e8ef;

  分割线 (<hr>)：
  - border: none; height: 1px; background: #e3e8ef; margin: 28px 0;

  提示框：
  - background: #e8f0fe; border-left: 4px solid #0d6efd;
  - padding: 14px 16px; margin: 20px 0; border-radius: 0 4px 4px 0;
  - font-size: 15px; color: #1a4a8a;

  第四部分：输出要求

  1. 图片使用原始 Markdown 中的 URL
  2. 只使用安全标签：section, p, span, strong, em, a, h2-h4, ul, ol, li, blockquote, pre, code, table, img, br, hr
  3. 返回完整 HTML，无需额外说明

  请转换以下 Markdown 内容：
