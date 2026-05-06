// Qwen Provider - 图片分析（支持两阶段处理）

import { readFileSync } from "node:fs";
import { getApiKey, getBaseUrl, getPrompt } from "../config.ts";
import type { ProviderConfig } from "../config.ts";

export interface AnalyzeOptions {
  provider: ProviderConfig;
  prompt: string;
  images: string[];
  maxPixels?: number;
  type?: string;  // 解析类型
  debug?: boolean;
}

export interface AnalyzeResult {
  success: boolean;
  content: string;
  error?: string;
}

async function readImageAsBase64(imagePath: string): Promise<string> {
  const ext = imagePath.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "jpg" ? "jpeg" : ext === "png" ? "png" : ext;
  const data = readFileSync(imagePath);

  const blob = new Blob([data]);
  const dataUrl = await new Response(blob).arrayBuffer();
  const bytes = new Uint8Array(dataUrl);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);

  return `data:image/${mimeType};base64,${b64}`;
}

/**
 * 调用 Qwen API（通用函数）
 */
async function callQwenApi(options: {
  provider: ProviderConfig;
  model: string;
  prompt: string;
  images: string[];
  maxPixels?: number;
  userPrompt?: string;
}): Promise<string> {
  const apiKey = getApiKey(options.provider);
  const baseUrl = getBaseUrl(options.provider);
  const endpoint = `${baseUrl}/chat/completions`;

  const imageDataUrls = await Promise.all(
    options.images.map(readImageAsBase64)
  );

  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: options.prompt }
  ];

  const userContent: Array<Record<string, unknown>> = [];
  if (options.userPrompt) {
    userContent.push({ type: "text", text: options.userPrompt });
  }
  if (imageDataUrls.length > 0) {
    userContent.push(...imageDataUrls.map(url => ({ type: "image_url", image_url: { url } })));
  }

  if (userContent.length === 0) {
    userContent.push({ type: "text", text: "请处理" });
  }
  messages.push({ role: "user", content: userContent });

  const payload: Record<string, unknown> = {
    model: options.model,
    messages,
    temperature: 0.1
  };

  // Qwen VL 特有参数
  if (options.maxPixels !== undefined) {
    payload.max_pixels = options.maxPixels;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json() as Record<string, unknown>;

  if (!response.ok) {
    const error = data.error as Record<string, unknown> | undefined;
    throw new Error((error?.message as string) || `HTTP ${response.status}`);
  }

  const choices = data.choices as Array<Record<string, unknown>> | undefined;
  if (choices && choices.length > 0) {
    const message = choices[0].message as Record<string, unknown> | undefined;
    const content = message?.content as string | undefined;
    if (content) return content;
  }

  throw new Error("未返回任何内容");
}

/**
 * 单图处理（使用 type 指定的 prompt）
 */
async function analyzeWhole(options: AnalyzeOptions): Promise<AnalyzeResult> {
  const promptTemplate = getPrompt(options.type || "default");

  try {
    const content = await callQwenApi({
      provider: options.provider,
      model: options.provider.vlModel,
      prompt: promptTemplate,
      images: options.images,
      maxPixels: options.maxPixels,
      userPrompt: options.prompt || undefined
    });

    return { success: true, content };
  } catch (e) {
    return { success: false, content: "", error: String(e) };
  }
}

/**
 * 切图处理 - 第一阶段：按 type 分析每个切片（与单图逻辑一致）
 */
export async function analyzeSliceStage1(options: AnalyzeOptions): Promise<AnalyzeResult> {
  const promptTemplate = getPrompt(options.type || "default");

  try {
    const content = await callQwenApi({
      provider: options.provider,
      model: options.provider.vlModel,
      prompt: promptTemplate,
      images: options.images,
      maxPixels: options.maxPixels,
      userPrompt: options.prompt || undefined
    });

    return { success: true, content };
  } catch (e) {
    return { success: false, content: "", error: String(e) };
  }
}

/**
 * 切图处理 - 第二阶段：拼装合成所有切片结果
 */
export async function analyzeSliceStage2(options: {
  provider: ProviderConfig;
  sliceResults: string[];  // 所有切片的分析结果
  maxPixels?: number;
}): Promise<AnalyzeResult> {
  const mergePrompt = getPrompt("merge");

  const systemPrompt = `${mergePrompt}

以下是 ${options.sliceResults.length} 个切片的分析结果：

---

${options.sliceResults.join("\n\n---\n\n")}`;

  try {
    const content = await callQwenApi({
      provider: options.provider,
      model: options.provider.model,  // 使用 LLM 模型拼装
      prompt: systemPrompt,
      images: []
    });

    return { success: true, content };
  } catch (e) {
    return { success: false, content: "", error: String(e) };
  }
}

/**
 * 主入口：根据是否切图选择处理方式
 */
export async function analyze(options: AnalyzeOptions): Promise<AnalyzeResult> {
  // 单图处理
  if (options.images.length === 1) {
    return await analyzeWhole(options);
  }

  // 切图处理 - 第一阶段
  const stage1Results = await Promise.all(
    options.images.map((img, i) =>
      analyzeSliceStage1({ ...options, images: [img] })
    )
  );

  // 检查是否有失败
  const failed = stage1Results.find(r => !r.success);
  if (failed) {
    return { success: false, content: "", error: `第一阶段失败: ${failed.error}` };
  }

  // Debug: 输出每个切片的识别结果到 stderr
  if (options.debug) {
    stage1Results.forEach((r, i) => {
      console.error(`\n===== 切片 ${i + 1}/${stage1Results.length} =====`);
      console.error(r.content);
      console.error(`===== 切片 ${i + 1} 结束 =====\n`);
    });
  }

  // 第二阶段：拼装合成
  const sliceResults = stage1Results.map(r => r.content);
  return await analyzeSliceStage2({
    provider: options.provider,
    sliceResults,
    maxPixels: options.maxPixels
  });
}
