# 暖橙主题
name: warm-orange
type: ai
description: "【暖橙】温暖亲和，橙色调，适合生活方式类内容"
version: "1.0"

# 风格说明
style_info:
  mood: "温暖亲和"
  colors: "橙色调"
  best_for: "生活方式、个人成长、情感故事、美食健身"

# 颜色方案
colors:
  background: "#fffdf9"
  text: "#4a3728"
  primary: "#e8590c"
  secondary: "#d9480f"
  heading: "#2d2d2d"
  quote_background: "#fff4e6"
  code_background: "#faf5f0"
  tip_background: "#fff4e6"
  tip_border: "#f08c00"

# AI 提示词模板
prompt: |
  【指令 V1.0】暖橙美学兼容性网页设计提示词

  指令：
  你是一位专业的网页设计师，对微信公众号编辑器的兼容性有深刻理解。根据以下风格指南，将 Markdown 内容转换为纯内联样式的微信 HTML。

  核心风格：温暖、亲和、治愈，橙色为主强调色。

  第一部分：技术要求

  【关键】结构：
  - 在内容外层包裹一个主 <div>，全局样式应用在此，而非 <body>
  - 主容器 padding: 20px 10px，max-width: 677px，margin: 0 auto，background-color: #fffdf9
  - 所有样式必须纯内联，禁止 <style> 标签和 class

  【关键】文字颜色保护：
  - 每个 <p> 标签必须显式添加 color: #4a3728;，防止微信重置为黑色

  第二部分：配色

  - 背景: #fffdf9（暖白，应用于主容器）
  - 正文: #4a3728（暖棕色）
  - 标题: #2d2d2d
  - 强调色: #e8590c（暖橙）
  - 副强调: #d9480f（深橙）
  - 引用背景: #fff4e6

  第三部分：元素样式

  一级标题 (<h2>)：
  - font-size: 20px; font-weight: bold; color: #2d2d2d;
  - border-left: 4px solid #e8590c; padding-left: 12px;
  - margin: 32px 0 16px;

  二级标题 (<h3>)：
  - font-size: 17px; font-weight: bold; color: #e8590c;
  - margin: 24px 0 12px;

  正文 (<p>)：
  - font-size: 16px; line-height: 2; color: #4a3728;
  - margin-bottom: 16px; text-align: justify;

  加粗 (<strong>)：
  - font-weight: bold; color: #d9480f;

  引用 (<blockquote>)：
  - background: #fff4e6; border-left: 4px solid #e8590c;
  - padding: 14px 16px; margin: 20px 0;
  - color: #6b5a4a; font-size: 15px; border-radius: 0 8px 8px 0;

  图片 (<img>)：
  - width: 100%; display: block; border-radius: 8px;
  - margin: 20px 0;

  代码块 (<pre>)：
  - background: #faf5f0; padding: 16px; border-radius: 6px;
  - font-family: monospace; font-size: 14px; line-height: 1.6;
  - overflow-x: auto; white-space: pre-wrap;

  表格 (<table>)：
  - width: 100%; border-collapse: collapse; font-size: 15px;
  - th: background: #faf5f0; font-weight: bold; color: #2d2d2d;
  - td, th: padding: 10px 14px; border: 1px solid #f0e6d8;

  分割线 (<hr>)：
  - border: none; height: 1px; background: #f0e6d8; margin: 28px 0;

  提示框：
  - background: #fff4e6; border-left: 4px solid #f08c00;
  - padding: 14px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;
  - font-size: 15px; color: #8a5a00;

  第四部分：输出要求

  1. 图片使用原始 Markdown 中的 URL
  2. 只使用安全标签：section, p, span, strong, em, a, h2-h4, ul, ol, li, blockquote, pre, code, table, img, br, hr
  3. 返回完整 HTML，无需额外说明

  请转换以下 Markdown 内容：
