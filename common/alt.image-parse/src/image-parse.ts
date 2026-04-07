#!/usr/bin/env bun

// Image Parse CLI - 图片分析主入口

import { parseArgs } from "node:util";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getAvailableProviders, getProvidersByName, hasEnvKeys, SLICER } from "./config.ts";
import { analyzeAndSlice } from "./slicer.ts";
import { analyze as analyzeQwen } from "./provider/qwen.ts";
import { analyze as analyzeMinimax } from "./provider/minimax-coding.ts";

const HELP = `
用法: bun image-parse.ts <图片路径> [options]

必填:
  <图片路径>        本地图片文件路径或 URL

可选:
  --type <类型>     解析类型: default | ocr | table | ui | design | photo | chart | reverse | chat
  --prompt <提示词> 补充分析要求，会追加到系统提示词中
  --provider <名称> 指定使用的 provider（按 config.json 中的 name）
  --help, -h        显示帮助

解析类型说明:
  - default: 通用默认解析（无特定侧重）
  - ocr: 精准文字识别，保留排版
  - table: 表格数据提取，输出 Markdown 表格
  - ui: 软件界面分析，提取组件和层级
  - design: 设计分析，提取配色排版等设计元素
  - photo: 照片分析，构图光线等技术分析
  - chart: 图表数据提取，识别数值和趋势
  - reverse: 提示词逆向，推测 AI 生成图的提示词
  - chat: 聊天记录提取，还原对话内容

说明:
  - 长图会自动切割处理
  - 支持格式: PNG, JPG, JPEG, WebP, BMP, TIFF
  - 支持 URL 自动下载
  - 分析结果直接输出到终端
`;

// Provider 分析函数映射
const providerAnalyzers = {
  qwen: analyzeQwen,
  "minimax-coding": analyzeMinimax,
} as const;

/**
 * 下载 URL 图片到临时文件
 */
async function downloadToTemp(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载失败: HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const ext = new URL(url).pathname.split(".").pop() || "jpg";
  const filename = `parse_${Date.now()}.${ext}`;
  const tempDir = join(import.meta.dir, "../.img-parse-temp");
  await mkdir(tempDir, { recursive: true });

  const tempPath = join(tempDir, filename);
  await Bun.write(tempPath, Buffer.from(buffer));

  return tempPath;
}

async function main() {
  // 解析参数
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h" },
      type: { type: "string", default: "default" },
      prompt: { type: "string" },
      provider: { type: "string" },
      debug: { type: "boolean" }
    },
    allowPositionals: true
  });

  if (values.help) {
    console.log(HELP);
    process.exit(0);
  }

  const imagePath = positionals[0];
  if (!imagePath) {
    console.error("错误: 缺少图片路径");
    console.log(HELP);
    process.exit(1);
  }

  const parseType = values.type!;
  const userPrompt = values.prompt
    ? `在满足系统提示词基础上，${values.prompt}`
    : "";

  // 处理 URL 或本地路径
  let localPath = imagePath;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    try {
      console.error(`正在下载: ${imagePath}`);
      localPath = await downloadToTemp(imagePath);
    } catch (e) {
      console.error(`错误: 无法下载图片 - ${e}`);
      process.exit(1);
    }
  }

  // 验证文件存在
  if (!existsSync(localPath)) {
    console.error(`错误: 文件不存在 - ${localPath}`);
    process.exit(1);
  }

  // 获取 providers
  const providerName = values.provider as string | undefined;
  let providers;

  if (providerName) {
    // 指定了 provider，找到所有同名 config，按顺序取第一个 env 满足的
    const matched = getProvidersByName(providerName);
    if (matched.length === 0) {
      console.error(`错误: 未找到 provider "${providerName}"，请检查 config.json`);
      process.exit(1);
    }
    const available = matched.filter(hasEnvKeys);
    if (available.length === 0) {
      const allKeys = matched.flatMap(p => p.envKeys);
      console.error(`错误: provider "${providerName}" 需要环境变量 ${allKeys.join(" 或 ")}，但未设置`);
      process.exit(1);
    }
    providers = available;
  } else {
    // 未指定 provider，按 config 顺序取有可用环境变量的
    providers = getAvailableProviders();
    if (providers.length === 0) {
      console.error("错误: 没有可用的 provider（环境变量未设置），请检查 config.json");
      process.exit(1);
    }
  }

  // Provider fallback 循环
  let lastError: string | undefined;

  for (const provider of providers) {
    try {
      console.error(`[Provider: ${provider.name}] 正在分析...`);

      // 图片切割
      const sliceResult = await analyzeAndSlice({
        provider,
        imagePath: localPath
      });

      console.error(`[Info] 图片尺寸: ${sliceResult.originalDimensions.width}×${sliceResult.originalDimensions.height} (${sliceResult.originalDimensions.pixels} 像素)`);
      if (sliceResult.needsSlicing) {
        console.error(`[Info] 长图检测: 切割为 ${sliceResult.images.length} 片`);
      }

      // 调用 provider 分析
      const analyzer = providerAnalyzers[provider.name as keyof typeof providerAnalyzers];
      if (!analyzer) {
        throw new Error(`未找到 provider: ${provider.name}`);
      }

      const result = await analyzer({
        provider,
        prompt: userPrompt || "",
        images: sliceResult.images,
        maxPixels: sliceResult.maxPixels,
        type: parseType,
        debug: values.debug || false
      });

      // 清理临时文件
      await sliceResult.cleanup();

      if (result.success) {
        console.log(result.content);
        return;
      } else {
        lastError = result.error;
        console.error(`[Provider: ${provider.name}] 失败: ${result.error}`);
      }

    } catch (e) {
      lastError = String(e);
      console.error(`[Provider: ${provider.name}] 异常: ${e}`);
    }
  }

  // 所有 provider 都失败
  console.error(`\n错误: 所有 provider 均失败`);
  if (lastError) {
    console.error(`最后错误: ${lastError}`);
  }

  // sharp 错误提示
  if (lastError?.includes("sharp") || lastError?.includes("libvips")) {
    console.error(`\n提示: sharp 需要系统依赖`);
    console.error(`  macOS: brew install vips`);
    console.error(`  Ubuntu: sudo apt-get install libvips-dev`);
  }

  process.exit(1);
}

main().catch(e => {
  console.error("错误:", e.message);
  process.exit(1);
});
