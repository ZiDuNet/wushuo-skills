---
name: poster-screen
description: |
   海报生成与智慧屏投放工作流。用户上传素材（PDF/PPT/图片/文字），根据已绑定屏幕的方向
   生成对应比例的海报（横屏16:9或竖屏9:16），截图预览确认后，投放至潮汐智慧屏。

version: 2.0.0
metadata:
   openclaw:
      emoji: "🖼️"
      requires:
         bins: ["node"]
---

# poster_screen — 海报投屏工作流

## 核心原则

**推图片，不推HTML。** 当前 HTML 投屏不稳定，统一用图片方式。

## 尺寸规则

| 屏幕方向 | 海报尺寸 | viewport |
|---------|---------|----------|
| 竖屏 | 1080×1920 (9:16) | width: 1080, height: 1920 |
| 横屏 | 1920×1080 (16:9) | width: 1920, height: 1080 |

---

## 完整流程

```
1. 素材收集
   └─ 支持：PDF、PPT、图片(JPG/PNG)、文字描述、URL网页
   └─ 存储路径：/home/linaro/.copaw/media/

2. 确定屏幕方向
   └─ 读取绑定文件：{skill}/.auth/default.bind.json
   └─ 获取 direction: "竖屏" 或 "横屏"
   └─ 如未绑定屏幕，询问用户选择比例

3. 生成海报
   └─ 使用 post-creator skill
   └─ 竖屏：1080×1920 (9:16)
   └─ 横屏：1920×1080 (16:9)
   └─ 避免 emoji，用 Unicode 符号（⚡🔋✦○●▸）

4. 截图预览
   └─ 使用 browser_use headed=true 模式（不要用 Python Playwright！）
   └─ viewport 根据屏幕方向：竖屏(1080,1920) / 横屏(1920,1080)
   └─ 截图路径：/home/linaro/.copaw/workspaces/default/poster_preview.png
   └─ 发送给用户确认

5. 用户确认
   └─ 用户确认OK后继续
   └─ 不满意则修改后重新截图

6. 投屏（推图片！）
   └─ **使用 cx-screen play-image**
   └─ cx-screen play-image <img_path> --user default
   └─ 鉴权：.auth/default.json 的 jwt
   └─ 直接运行，无需检查登录状态
   └─ 投屏无需指定 SN
```

---

## 第一步：读取屏幕绑定信息

在开始工作前，必须先读取绑定文件确定屏幕方向：

```bash
# 屏幕绑定文件路径
BIND_FILE="/home/linaro/.copaw/workspaces/default/skills/cx-screen/.auth/default.bind.json"

# 读取 direction
DIRECTION=$(cat "$BIND_FILE" | grep -o '"direction":"[^"]*"' | cut -d'"' -f4)

# 如果未绑定或文件不存在，询问用户
if [ -z "$DIRECTION" ]; then
  echo "未检测到屏幕绑定，请选择比例："
  echo "1. 竖屏 9:16 (1080×1920)"
  echo "2. 横屏 16:9 (1920×1080)"
  # 等待用户输入...
fi

echo "屏幕方向: $DIRECTION"
```

### 绑定文件格式

```json
{
   "screenId": "e808dc48ab3afd42",
   "direction": "竖屏",
   "boundAt": 1775212339698
}
```

## 第二步：使用 browser_use 截图预览

### ⚠️ 踩坑记录（重要！）

| 坑 | 现象 | 原因 | 解法 |
|----|------|------|------|
| Playwright 内置浏览器缺失 | `Executable doesn't exist at .../ms-playwright/chromium-xxx` | 系统未执行 `playwright install`，无内置 Chromium | **不要用 Python playwright**，改用 browser_use |
| 系统 Chromium + Python Playwright | `TargetClosedError: Target page, context or browser has been closed` | 系统 Chromium 版本与 Playwright 不兼容 | **不要用 Python playwright**，改用 browser_use |
| browser_use headless 模式 | `FATAL:platform_selection.cc(50) Invalid ozone platform: headless` | Debian + 系统 Chromium 不支持 Playwright 的 headless ozone 模式 | **必须用 headed=true** 启动浏览器 |
| DISPLAY 环境变量 | headed 模式启动失败 | 需要 X11 display | 确保 `DISPLAY=:0` 已设置 |

### ✅ 正确的截图流程

**核心原则：用 browser_use headed 模式截图，不要用 Python Playwright 直接调。**

```python
# 步骤 1：启动浏览器（必须 headed=true！）
browser_use(action="start", headed=True)

# 步骤 2：打开海报 HTML
browser_use(action="open", url="file:///home/linaro/.copaw/workspaces/default/poster.html")

# 步骤 3：设置 viewport（根据屏幕方向）
#   竖屏 9:16 → width: 1080, height: 1920
#   横屏 16:9 → width: 1920, height: 1080
browser_use(action="resize", width=1080, height=1920)  # 竖屏示例

# 步骤 4：全页截图
browser_use(action="screenshot", path="/home/linaro/.copaw/workspaces/default/poster_preview.png", full_page=True)

# 步骤 5：发送给用户确认
send_file_to_user(file_path="/home/linaro/.copaw/workspaces/default/poster_preview.png")
```

### ❌ 不要这样做

```python
# 错误 1：用 Python playwright 直接调（浏览器缺失或版本不兼容）
from playwright.sync_api import sync_playwright
browser = p.chromium.launch(headless=True)  # 崩！

# 错误 2：指定 executable_path 用系统 chromium（TargetClosedError）
browser = p.chromium.launch(executable_path='/usr/bin/chromium')  # 崩！

# 错误 3：browser_use 默认 headless 模式（Invalid ozone platform）
browser_use(action="start")  # 默认 headless，在 Debian 上崩！

# 错误 4：viewport 尺寸写反
browser_use(action="resize", width=1920, height=1080)  # 竖屏时写反了！
```

### 截图视口尺寸

| 屏幕方向 | resize 参数 | 截图路径 |
|---------|------------|---------|
| 竖屏 9:16 | width: 1080, height: 1920 | poster_preview.png |
| 横屏 16:9 | width: 1920, height: 1080 | poster_preview.png |

## cx-screen 投屏命令

```bash
# 投图片（推荐）
node /home/linaro/.copaw/workspaces/default/skills/cx-screen/cx-screen play-image <img_path> --user default

# 投 HTML（暂不可用）
# node /home/linaro/.copaw/workspaces/default/skills/cx-screen/cx-screen play-html <html_path> --user default

# 注意：user 固定用 default
# 直接运行，无需检查登录状态
# 投屏无需指定 SN
```

---

## 图片转 base64（HTML内嵌）

```python
import base64

def image_to_base64(image_path):
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# HTML中使用
<img src="data:image/png;base64,${image_to_base64('/path/img.png')}" />
```

---

## 从 URL 提取内容的技巧

**场景**：用户发送网页链接（新闻、公告、活动页面等），需要提取内容制作海报。

### 处理流程

1. **检测 URL**：识别用户消息中的 `http://` 或 `https://` 链接

2. **使用 browser_use 加载页面**：
   ```python
   # 启动浏览器
   browser_use(action="start", headed=False)
   
   # 打开URL
   browser_use(action="open", url="用户发送的URL", page_id="default")
   
   # 获取页面快照
   browser_use(action="snapshot")
   ```

3. **提取关键信息**：

4. **分析后生成海报**：

### 注意事项

| 项目 | 说明 |
|------|------|
| **内容限制** | 海报文字有限，提取精华内容（标题+日期+50字摘要） |
| **长文本处理** | 正文超长时截取前200字或关键段落 |
| **无内容时** | 如果页面是登录页或需要交互，提示用户手动复制内容 |
| **emoji处理** | 从网页提取的emoji统一替换为Unicode符号 |

---

## 从 Excel 文件提取内容的技巧

**场景**：用户上传 Excel 文件，需要提取数据制作海报。

### 读取方法

使用 xlsx skill 的 pandas 读取：

```python
import pandas as pd

file_path = '/home/linaro/.copaw/workspaces/default/media/xxx.xlsx'
all_sheets = pd.read_excel(file_path, sheet_name=None)

for sheet_name, df in all_sheets.items():
    print(f'=== Sheet: {sheet_name} ===')
    print(df.to_string())
```

### 运行方式

```bash
cd /home/linaro/.copaw/workspaces/default/skills/xlsx
python3 scripts/recalc.py  # 用于公式重算
```

### 注意事项

| 项目 | 说明 |
|------|------|
| sheet_name=None | 读取所有 sheet |
| to_string() | 显示完整内容 |
| 文件路径 | 用户上传文件在 `/home/linaro/.copaw/workspaces/default/media/` |

---

## 从用户图片中提取内容的技巧

**场景**：用户上传聊天截图、宣传图等，需要从中提取文字内容制作海报。

### 核心规则

**必须且只能使用 alt-image-parse 技能识别图片，禁止用 browser_use / playwright 截图等其他方式。**

### 识别流程

1. **确认图片路径**：用户上传文件会下载到 `/home/linaro/.copaw/workspaces/default/media/`

2. **使用 alt-image-parse 识别**：
   ```bash
   bash /home/linaro/.copaw/workspaces/default/skills/alt-image-parse/img-parse <图片路径> --type chat
   ```
   - **无特别要求时，优先使用 `--type chat`**：聊天截图、对话记录、AI助手界面截图等都能处理，提取关键信息的能力最全面
   - `--type ocr`：文档扫描、合同票据等纯文字图片
   - `--type marketing`：广告海报、宣传物料的设计分析
   - `--type default`：通用兜底，仅在无法判断图片类型时使用

3. **识别后提取关键信息**：
   - 聊天记录 → 找核心诉求（如：领导要求显示的文字）
   - AI 助手截图 → 提取任务内容、屏幕方向、文案等关键参数
   - 宣传图 → 提取标题、日期、地点等结构化信息
   - 优先提取用户实际需要的文案，而非聊天上下文

4. **示例**：
   - 用户上传聊天截图，群里有人说"请将一号屏更换为XXX"
   - → 识别后提取 "XXX" 作为海报内容
   - 用户上传 AI 助手对话截图，其中包含"热烈欢迎XXX一行莅临指导"
   - → 识别后提取欢迎文案和屏幕方向参数

### 踩坑记录

| 坑 | 现象 | 原因 | 解法 |
|----|------|------|------|
| 用 browser_use 打开图片 | 被用户打断，效率低 | browser_use 不是图片识别工具 | **必须用 alt-image-parse** |
| type 选错 | 提取内容不精准 | 不同 type 有不同的专业分析框架 | **无特殊要求优先 chat**，chat 对各类截图都有较好的提取能力 |
| 路径写错 | `file not found` | skill 文件夹名是 `alt-image-parse`（带连字符） | 确认路径：`skills/alt-image-parse/img-parse` |

### write_file 返回值说明

调用 `write_file` 写入 HTML 后，回复 `Wrote xxx bytes to xx.html` 代表写入成功，无须重新写入。

---

## 流程示例对话

### 场景一：用户提供内容

```
用户：帮我做个海报投屏

助手：
1. 检测屏幕绑定...
   └─ 绑定屏幕：e808dc48ab3afd42
   └─ 屏幕方向：竖屏
   └─ 将生成竖屏海报 1080×1920 (9:16)

2. 根据用户提供内容分析去确定海报内容画面布局及颜色风格

3. 生成海报中...
   └─ Wrote 15.2 KB to poster.html

4. 截图预览已生成
   [发送预览图给用户]

用户：可以

助手：
5. 投屏中...
   └─ cx-screen play-image poster_preview.png --user default
   └─ {ok: true, message: "图片投放成功"}
   
   ✓ 投屏完成！
```

### 场景二：用户提供URL

```
用户：帮我做这个海报 https://www.bcegc.com/menu15/newsDetail/xxx.html

助手：
1. 检测到URL，正在加载页面...
   └─ browser_use(action="start")
   └─ browser_use(action="open", url="https://www.bcegc.com/menu15/newsDetail/xxx.html")

2. 提取内容：
   - 标题：获评首批"大国工匠"！
   - 日期：2025-09-30
   - 摘要：陶建伟入选首批200名大国工匠人才名单...
   
3. 检测屏幕绑定...
   └─ 屏幕方向：竖屏
   └─ 将生成竖屏海报 1080×1920 (9:16)

4. 是否使用以下内容制作海报？
   - 主标题：获评首批"大国工匠"！
   - 日期：2025-09-30
   - 摘要：陶建伟入选首批200名大国工匠人才名单
   （回复"可以"确认，或告诉我要修改的内容）

用户：可以

助手：
5. 生成海报中...
   └─ Wrote 15.2 KB to poster.html

6. 截图预览已生成
   [发送预览图给用户]

用户：可以

助手：
7. 投屏中...
   └─ cx-screen play-image poster_preview.png --user default
   └─ {ok: true, message: "图片投放成功"}
   
   ✓ 投屏完成！
```

---

## 注意事项

| 项目 | 说明 |
|------|------|
| **投屏方式** | **必须用 play-image，不要用 play-html** |
| 尺寸自动 | 根据绑定屏幕的 direction 自动选择 9:16 或 16:9 |
| emoji | 避免！统一用 Unicode 符号 |
| cx-screen user | 固定 `default` |
| 鉴权文件 | `/skills/cx-screen/.auth/default.json` |
| 投屏前 | 必须截图发给用户确认 |
| 支持格式 | PDF、PPT、图片、纯文字、URL网页 |
| **图片识别** | **必须用 alt-image-parse**，禁止用 browser_use 等其他方式；无特别要求优先 `--type chat`；超时至少 600s |
| **URL处理** | 用 browser_use 加载页面，提取标题/日期/正文制作海报 |