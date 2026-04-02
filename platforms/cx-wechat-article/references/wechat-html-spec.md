# 微信公众号 HTML 规范

微信公众号编辑器对 HTML 有严格限制。以下是生成兼容 HTML 的完整规范。

---

## 核心限制

1. **所有样式必须 inline** — 微信会过滤 `<style>` 标签、`class` 属性、`<script>`
2. **不支持 JavaScript** — 不能用任何 JS
3. **外部图片会被屏蔽** — 草稿 API 推送时，正文中非微信域名的图片不会显示
4. **支持的标签**：`<p>`, `<h1>`~`<h4>`, `<img>`, `<a>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<table>`, `<tr>`, `<td>`, `<th>`, `<section>`, `<span>`, `<strong>`, `<em>`, `<br>`, `<hr>`, `<pre>`, `<code>`

---

## HTML 模板

```html
<section style="max-width: 677px; margin: 0 auto; padding: 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #333; font-size: 16px; line-height: 1.8;">

  <!-- 文章标题 -->
  <h1 style="font-size: 22px; font-weight: bold; color: #1a1a1a; text-align: center; margin: 32px 0 16px; line-height: 1.4;">
    文章标题
  </h1>

  <!-- 作者信息 -->
  <p style="font-size: 14px; color: #999; text-align: center; margin-bottom: 32px;">
    作者 · 日期
  </p>

  <!-- 正文段落 -->
  <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px; text-align: justify;">
    正文内容...
  </p>

  <!-- 小节标题 -->
  <h2 style="font-size: 18px; font-weight: bold; color: #1a1a1a; margin: 32px 0 16px; padding-left: 12px; border-left: 4px solid #1a1a1a;">
    小节标题
  </h2>

  <!-- 引用块 -->
  <blockquote style="margin: 20px 0; padding: 16px 20px; background: #f8f8f8; border-left: 4px solid #ccc; color: #666; font-size: 15px;">
    <p style="margin: 0; line-height: 1.8;">引用内容</p>
  </blockquote>

  <!-- 图片 -->
  <figure style="margin: 24px 0; text-align: center;">
    <img src="图片URL" style="width: 100%; border-radius: 4px; display: block;" alt="图片描述">
    <figcaption style="font-size: 13px; color: #999; margin-top: 8px;">图片说明（可选）</figcaption>
  </figure>

  <!-- 表格 -->
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left; font-weight: bold;">标题1</th>
        <th style="padding: 12px 16px; border: 1px solid #e0e0e0; text-align: left; font-weight: bold;">标题2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">内容1</td>
        <td style="padding: 12px 16px; border: 1px solid #e0e0e0;">内容2</td>
      </tr>
    </tbody>
  </table>

  <!-- 代码块 -->
  <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 20px 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 14px; line-height: 1.6;"><code>代码内容</code></pre>

  <!-- 行内代码 -->
  <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
    正文中的 <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">代码</code> 示例
  </p>

  <!-- 无序列表 -->
  <ul style="padding-left: 24px; margin: 16px 0;">
    <li style="margin-bottom: 8px; line-height: 1.8;">列表项1</li>
    <li style="margin-bottom: 8px; line-height: 1.8;">列表项2</li>
  </ul>

  <!-- 有序列表 -->
  <ol style="padding-left: 24px; margin: 16px 0;">
    <li style="margin-bottom: 8px; line-height: 1.8;">列表项1</li>
    <li style="margin-bottom: 8px; line-height: 1.8;">列表项2</li>
  </ol>

  <!-- 分割线 -->
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <!-- 强调文字 -->
  <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">
    <strong style="font-weight: bold; color: #1a1a1a;">加粗文字</strong> 和 <em style="color: #666;">斜体文字</em>
  </p>

  <!-- 高亮提示框 -->
  <section style="margin: 24px 0; padding: 20px; background: #fff8e6; border-radius: 4px; border-left: 4px solid #f0ad4e;">
    <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #664d03;">
      💡 提示内容
    </p>
  </section>

</section>
```

---

## 注意事项

- 微信不支持的标签会被直接移除
- `<a>` 标签的 `href` 只支持 `http/https` 协议
- 图片最好控制宽度在 677px 以内（微信正文区域宽度）
- 表格不要太宽，手机端会横向滚动体验差
- 段落之间用 `margin-bottom` 控制间距，不要用 `<br>` 堆叠
