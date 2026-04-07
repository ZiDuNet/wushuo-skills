// MiniMax Coding Plan Provider - 图片分析
// VLM: Coding Plan 专用接口（硬编码）
// LLM: OpenAI 兼容接口（用 config 里的 baseUrl）

import { getApiKey, getBaseUrl, getPrompt } from "../config.ts";
import type { ProviderConfig } from "../config.ts";

export interface AnalyzeOptions {
  provider: ProviderConfig;
  prompt: string;
  images: string[];
  maxPixels?: number;
  type?: string;
  debug?: boolean;
}

export interface AnalyzeResult {
  success: boolean;
  content: string;
  error?: string;
}

const VLM_ENDPOINT = "https://api.minimaxi.com/v1/coding_plan/vlm";

async function readImageAsBase64(imagePath: string): Promise<string> {
  const ext = imagePath.split(".").pop()?.toLowerCase() || "jpg";
  const mimeType = ext === "jpg" ? "jpeg" : ext === "png" ? "png" : ext;
  const data = await Bun.file(imagePath).arrayBuffer();
  const bytes = new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return `data:image/${mimeType};base64,${b64}`;
}

/**
 * VLM: MiniMax Coding Plan 专用接口
 */
async function callVlmApi(options: {
  provider: ProviderConfig;
  prompt: string;
  imageUrl: string;
}): Promise<string> {
  const apiKey = getApiKey(options.provider);

  const payload = {
    prompt: options.prompt,
    image_url: options.imageUrl
  };

  const response = await fetch(VLM_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "MM-API-Source": "Minimax-MCP"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json() as Record<string, unknown>;

  if (!response.ok) {
    const error = data.error as Record<string, unknown> | undefined;
    throw new Error((error?.message as string) || `HTTP ${response.status}`);
  }

  const content = data.content as string | undefined;
  if (content) return content;

  throw new Error("未返回任何内容");
}

/**
 * LLM: OpenAI 兼容接口（chat/completions）
 */
async function callLlmApi(options: {
  provider: ProviderConfig;
  prompt: string;
}): Promise<string> {
  const apiKey = getApiKey(options.provider);
  const baseUrl = getBaseUrl(options.provider);
  const endpoint = `${baseUrl}/chat/completions`;

  const messages = [
    { role: "system", content: options.prompt },
    { role: "user", content: "请处理" }
  ];

  const payload = {
    model: options.provider.model,
    messages,
    temperature: 0.1
  };

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
 * 主入口
 */
export async function analyze(options: AnalyzeOptions): Promise<AnalyzeResult> {
  const promptTemplate = getPrompt(options.type || "default");

  // 单图：VLM 直接分析
  if (options.images.length === 1) {
    try {
      const imageUrl = await readImageAsBase64(options.images[0]);
      const userPrompt = options.prompt ? `${promptTemplate}\n\n${options.prompt}` : promptTemplate;

      const content = await callVlmApi({
        provider: options.provider,
        prompt: userPrompt,
        imageUrl
      });

      return { success: true, content };
    } catch (e) {
      return { success: false, content: "", error: String(e) };
    }
  }

  // 切片 Stage 1：VLM 分析每个切片
  const stage1Results: AnalyzeResult[] = [];

  for (let i = 0; i < options.images.length; i++) {
    try {
      const imageUrl = await readImageAsBase64(options.images[i]);
      const userPrompt = options.prompt ? `${promptTemplate}\n\n${options.prompt}` : promptTemplate;

      const content = await callVlmApi({
        provider: options.provider,
        prompt: userPrompt,
        imageUrl
      });

      stage1Results.push({ success: true, content });

      if (options.debug) {
        console.error(`\n===== 切片 ${i + 1}/${options.images.length} =====`);
        console.error(content);
        console.error(`===== 切片 ${i + 1} 结束 =====\n`);
      }
    } catch (e) {
      stage1Results.push({ success: false, content: "", error: String(e) });
    }
  }

  const failed = stage1Results.find(r => !r.success);
  if (failed) {
    return { success: false, content: "", error: `切片分析失败: ${failed.error}` };
  }

  // 切片 Stage 2：LLM 拼装合成
  const mergePrompt = getPrompt("merge");
  const sliceResults = stage1Results.map(r => r.content);

  const systemPrompt = `${mergePrompt}

以下是 ${sliceResults.length} 个切片的分析结果：

---

${sliceResults.join("\n\n---\n\n")}`;

  try {
    const content = await callLlmApi({
      provider: options.provider,
      prompt: systemPrompt
    });
    return { success: true, content };
  } catch (e) {
    return { success: false, content: "", error: String(e) };
  }
}
