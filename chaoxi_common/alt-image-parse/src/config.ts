// 配置 - 从 ../config.json 读取

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 手动读取 JSON 文件（Node.js 24 需要）
const configPath = join(__dirname, "../config.json");
const config = JSON.parse(readFileSync(configPath, "utf-8"));

type ProviderConfig = {
  name: string;
  model: string;
  vlModel?: string;
  envKeys: string[];
  pixels: { default: number; max: number };
  baseUrl: string;
};

// 导出配置
export const CONFIG = config as {
  providers: ProviderConfig[];
  slicer: { overlap: number };
};

// 获取所有 provider（不再按 enabled 过滤，由 env 控制可用性）
export function getAllProviders(): ProviderConfig[] {
  return CONFIG.providers;
}

// 检查 provider 的环境变量是否满足
export function hasEnvKeys(provider: ProviderConfig): boolean {
  return provider.envKeys.some(key => !!process.env[key]);
}

// 获取有可用环境变量的 provider 列表（按 config 顺序）
export function getAvailableProviders(): ProviderConfig[] {
  return getAllProviders().filter(hasEnvKeys);
}

// 按名称查找所有同名 provider（同一 name 可能有多个，各自用不同 env key）
export function getProvidersByName(name: string): ProviderConfig[] {
  return getAllProviders().filter(p => p.name === name);
}

// 从 envKeys 数组中获取第一个可用的 API key
export function getApiKey(provider: ProviderConfig): string {
  for (const key of provider.envKeys) {
    const value = process.env[key];
    if (value) return value;
  }
  throw new Error(`未设置环境变量: ${provider.envKeys.join(" 或 ")}`);
}

// 获取 baseUrl，支持环境变量覆盖
export function getBaseUrl(provider: ProviderConfig): string {
  return process.env[`${provider.name.toUpperCase()}_BASE_URL`] || provider.baseUrl;
}

// 获取 prompt 文件内容
const promptCache = new Map<string, string>();

/**
 * 加载提示词模板
 * @param type 提示词类型，如 "default", "ocr", "table" 等
 * @returns 提示词内容
 */
export function getPrompt(type: string = "default"): string {
  const cacheKey = `prompt:${type}`;
  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }

  // 优先查找 prompts/ 目录（新版）
  const promptsDir = join(__dirname, "../prompts");
  if (existsSync(promptsDir)) {
    const promptFile = join(promptsDir, `${type.toLowerCase()}.md`);
    if (existsSync(promptFile)) {
      const content = readFileSync(promptFile, "utf-8");
      promptCache.set(cacheKey, content);
      return content;
    }

    // 请求的类型不存在，fallback 到 default
    const defaultFile = join(promptsDir, "default.md");
    if (existsSync(defaultFile)) {
      const content = readFileSync(defaultFile, "utf-8");
      promptCache.set(cacheKey, content);
      return content;
    }
  }

  // fallback 到旧的 prompt 目录
  const oldPromptPath = join(__dirname, "../prompt/WHOLE_IMG.MD");
  if (existsSync(oldPromptPath)) {
    const content = readFileSync(oldPromptPath, "utf-8");
    promptCache.set(cacheKey, content);
    return content;
  }

  throw new Error(`提示词文件不存在: ${type}`);
}

/**
 * 获取可用的提示词类型列表
 */
export function getAvailablePromptTypes(): string[] {
  const promptsDir = join(__dirname, "../prompts");
  if (!existsSync(promptsDir)) {
    return ["default"];
  }

  return readdirSync(promptsDir)
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(".md", ""))
    .sort();
}

// 导出 slicer 配置
export const SLICER = CONFIG.slicer;
