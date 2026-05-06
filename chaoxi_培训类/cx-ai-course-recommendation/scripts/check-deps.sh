#!/bin/bash
# 潮汐AI课程推荐 skill 依赖自检
# 运行: bash scripts/check-deps.sh
set -e

MISSING=()

echo "=== 潮汐AI 依赖自检 ==="

# 1. node
if command -v node &>/dev/null; then
  echo "✅ node $(node -v)"
else
  echo "❌ node 未安装"
  MISSING+=("node")
fi

# 2. chromium
if command -v chromium &>/dev/null || command -v chromium-browser &>/dev/null; then
  echo "✅ chromium 已安装"
else
  echo "❌ chromium 未安装（PDF 输出需要）"
  MISSING+=("chromium")
fi

# 3. bun/npx
if command -v bun &>/dev/null; then
  echo "✅ bun $(bun -v)"
elif command -v npx &>/dev/null; then
  echo "✅ npx 可用"
else
  echo "❌ bun/npx 未安装（HTML 输出需要）"
  MISSING+=("bun")
fi

# 4. feishu-wiki.js
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/feishu-wiki.js" ]; then
  echo "✅ feishu-wiki.js 已就绪"
else
  echo "❌ feishu-wiki.js 缺失"
  MISSING+=("feishu-wiki.js")
fi

# 5. draw.io MCP
HERMES_CONFIG="${HOME}/.hermes/config.yaml"
if [ -f "$HERMES_CONFIG" ] && grep -q "drawio" "$HERMES_CONFIG" 2>/dev/null; then
  echo "✅ draw.io MCP 已配置"
else
  echo "⚠️ draw.io MCP 未配置（图表生成需要）"
  MISSING+=("drawio-mcp")
fi

# 汇总
if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "=== 缺少 ${#MISSING[@]} 项依赖，执行自动安装 ==="
  for dep in "${MISSING[@]}"; do
    case $dep in
      node)
        echo "📦 安装 node..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null && \
          sudo apt install -y nodejs 2>/dev/null || \
          echo "⚠️ 自动安装失败，请手动: apt install nodejs"
        ;;
      chromium)
        echo "📦 安装 chromium..."
        sudo apt update -qq 2>/dev/null
        sudo apt install -y chromium-browser 2>/dev/null || \
          echo "⚠️ 自动安装失败，请手动: apt install chromium-browser"
        ;;
      bun)
        echo "📦 安装 bun..."
        curl -fsSL https://bun.sh/install | bash 2>/dev/null || \
          echo "⚠️ 自动安装失败，请手动: curl -fsSL https://bun.sh/install | bash"
        ;;
      drawio-mcp)
        echo ""
        echo "⚠️ draw.io MCP 未配置。请在 ~/.hermes/config.yaml 的 mcp_servers 段添加："
        echo "  drawio:"
        echo "    type: stdio"
        echo "    command: npx"
        echo '    args: ["-y", "drawio-mcp"]'
        echo ""
        ;;
      "feishu-wiki.js")
        echo "⚠️ feishu-wiki.js 缺失，请确保 skill 完整克隆"
        ;;
    esac
  done
else
  echo ""
  echo "✅ 所有依赖已就绪"
fi

echo "=== 自检完成 ==="
