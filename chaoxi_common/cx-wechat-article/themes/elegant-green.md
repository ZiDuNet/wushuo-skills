# 优雅绿主题
name: elegant-green
type: ai
description: "【优雅绿】清新自然，绿色调，适合文化旅行类内容"
version: "1.0"

# 风格说明
style_info:
  mood: "清新自然"
  colors: "绿色调"
  best_for: "旅行日记、健康文化、教育读书、自然环保"

# 颜色方案
colors:
  background: "#fefffe"
  text: "#364634"
  primary: "#2b8a3e"
  secondary: "#1e7a31"
  heading: "#1a1a1a"
  quote_background: "#ebfbee"
  code_background: "#f1f8f2"
  tip_background: "#ebfbee"
  tip_border: "#40c057"

# AI 提示词模板
prompt: |
  【指令 V1.0】优雅绿清新风格网页设计提示词

  指令：
  你是一位专业的网页设计师，对微信公众号编辑器的兼容性有深刻理解。根据以下风格指南，将 Markdown 内容转换为纯内联样式的微信 HTML。

  核心风格：清新、自然、优雅，绿色为主强调色。

  第一部分：技术要求

  【关键】结构：
  - 在内容外层包裹一个主 <div>，全局样式应用在此，而非 <body>
  - 主容器 padding: 20px 10px，max-width: 677px，margin: 0 auto，background-color: #fefffe
  - 所有样式必须纯内联，禁止 <style> 标签和 class

  【关键】文字颜色保护：
  - 每个 <p> 标签必须显式添加 color: #364634;，防止微信重置为黑色

  第二部分：配色

  - 背景: #fefffe（清新白）
  - 正文: #364634（深绿灰）
  - 标题: #1a1a1a
  - 强调色: #2b8a3e（自然绿）
  - 引用背景: #ebfbee
  - 引用左边框: #2b8a3e

  第三部分：元素样式

  一级标题 (<h2>)：
  - font-size: 20px; font-weight: bold; color: #1a1a1a;
  - border-left: 4px solid #2b8a3e; padding-left: 12px;
  - margin: 32px 0 16px;

  二级标题 (<h3>)：
  - font-size: 17px; font-weight: bold; color: #2b8a3e;
  - margin: 24px 0 12px;

  正文 (<p>)：
  - font-size: 16px; line-height: 1.9; color: #364634;
  - margin-bottom: 16px; text-align: justify;

  加粗 (<strong>)：
  - font-weight: bold; color: #2b8a3e;

  引用 (<blockquote>)：
  - background: #ebfbee; border-left: 4px solid #2b8a3e;
  - padding: 14px 16px; margin: 20px 0;
  - color: #4a6b4a; font-size: 15px; border-radius: 0 6px 6px 0;

  图片 (<img>)：
  - width: 100%; display: block; border-radius: 6px;
  - margin: 20px 0;

  代码块 (<pre>)：
  - background: #f1f8f2; padding: 16px; border-radius: 4px;
  - font-family: monospace; font-size: 14px; line-height: 1.6;
  - overflow-x: auto; white-space: pre-wrap;

  表格 (<table>)：
  - width: 100%; border-collapse: collapse; font-size: 15px;
  - th: background: #f1f8f2; font-weight: bold; color: #1a1a1a;
  - td, th: padding: 10px 14px; border: 1px solid #d3e4d5;

  分割线 (<hr>)：
  - border: none; height: 1px; background: #d3e4d5; margin: 28px 0;

  提示框：
  - background: #ebfbee; border-left: 4px solid #40c057;
  - padding: 14px 16px; margin: 20px 0; border-radius: 0 6px 6px 0;
  - font-size: 15px; color: #1a6b3a;

  第四部分：输出要求

  1. 图片使用原始 Markdown 中的 URL
  2. 只使用安全标签：section, p, span, strong, em, a, h2-h4, ul, ol, li, blockquote, pre, code, table, img, br, hr
  3. 返回完整 HTML，无需额外说明

  请转换以下 Markdown 内容：
