# HTML Card → PNG 快速出图模式

> 适用场景：用户需要将结构化信息（套餐表、对比表、待办清单+合同条款等）生成**单张长图**。此模式绕开复杂的 infographic skill 流程，直接 HTML 渲染 + Chromium 截图，对中文支持完美。

## 完整流程

### 1. 编写 HTML 卡片

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8">
<style>
/* 全部 CSS 内联，不要外部文件 */
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;background:#f5f0eb;display:flex;justify-content:center;padding:20px}
.card{width:750px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#8B5E3C,#C49A6C);color:#fff;padding:28px 32px;text-align:center}
.section{padding:20px 28px;border-bottom:1px solid #f0ebe3}
.footer{background:#8B5E3C;color:#fff;text-align:center;padding:28px;font-size:28px}
</style>
</head>
<body>
<div class="card">
  <!-- 内容 -->
</div>
</body>
</html>
```

### 2. Chromium 截图

```bash
chromium --headless --disable-gpu \
  --screenshot="output.png" \
  --window-size=790,1800 \
  "file:///absolute/path/to/card.html"
```

### 3. 关键参数

| 参数 | 说明 |
|------|------|
| `--window-size=W,H` | 宽750-800px（卡片宽+padding），高度根据内容预估（表多就高） |
| `--screenshot` | 全页截图（非 viewport，自动扩展到内容高度） |
| 卡片 `.card` 宽度 | 固定 750px，确保所有文字不换行 |

### 4. 常用配色

| 用途 | 颜色 |
|------|------|
| 主色调（header/footer 背景） | `#8B5E3C` → `#C49A6C` 渐变（暖棕金，适合婚庆） |
| 或企业蓝 | `#1E3A5F` → `#3B82F6` 渐变 |
| 合同条款背景 | `#fdf8f4` 浅暖灰 |
| 警告标记 | `#e74c3c` 红色 + `#ffeaea` 浅红背景 |

### 5. 迭代修改

此模式的核心优势是**修改极快**：改 HTML → 重新截图，3秒完成。适合用户反复提"加一条""删一条""改个颜色"的场景。

### 6. 踩过的坑

- Chromium `--screenshot` 截图的是视口（viewport），内容超出会被裁。用 `--window-size` 设足够高，或用 `--print-to-pdf` 代替验证内容高度
- 中文必须用系统字体 fallback：`-apple-system, 'PingFang SC', 'Microsoft YaHei'`
- 不要用 web font 或 Google Fonts import——Chromium headless 在无网络环境会阻塞渲染
- 图片输出路径用绝对路径，相对路径可能解析失败
