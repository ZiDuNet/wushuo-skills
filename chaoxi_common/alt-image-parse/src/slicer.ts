// 图片切割模块 - 基于用户提供的逻辑

import sharp from "sharp";
import { mkdir, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProviderConfig } from "./config.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface SliceResult {
  needsSlicing: boolean;
  images: string[];              // 图片路径（单图或切片路径）
  maxPixels?: number;            // 用于 API 调用的 max_pixels 参数
  originalDimensions: { width: number; height: number; pixels: number };
  cleanup: () => Promise<void>;
}

export interface SliceOptions {
  provider: ProviderConfig;
  imagePath: string;
}

/**
 * 分析并切割图片
 */
export async function analyzeAndSlice(options: SliceOptions): Promise<SliceResult> {
  const metadata = await sharp(options.imagePath).metadata();
  const width = metadata.width!;
  const height = metadata.height!;
  const pixels = width * height;

  const ratio = height / width;
  const { default: defaultPixels, max: maxPixels } = options.provider.pixels;
  const overlapHeight = 300;

  // ========== 判断是否需要切割 ==========
  // 竖屏 && 像素 > max×2 → 切割
  const needsSlicing = ratio >= 2 && pixels > maxPixels * 2;

  if (!needsSlicing) {
    // 不切割：maxPixels = min(max, max(default, pixels/2))
    const maxPixelsForApi = Math.min(maxPixels, Math.max(defaultPixels, Math.ceil(pixels / 2)));

    return {
      needsSlicing: false,
      images: [options.imagePath],
      maxPixels: maxPixelsForApi,
      originalDimensions: { width, height, pixels },
      cleanup: async () => {}
    };
  }

  // ========== 需要切割 ==========
  const maxImgCropSize = 16384;  // OSS 最大裁剪尺寸
  const minSplitCountViaOssCrop = Math.ceil(height / (maxImgCropSize - overlapHeight * 2));
  const minSplitCountViaAi = Math.ceil(pixels / (maxPixels * 2));
  const splitCount = Math.max(minSplitCountViaOssCrop, minSplitCountViaAi);
  const splitHeight = Math.ceil(height / splitCount);

  // 创建临时目录
  const tempDir = join(__dirname, "../.img-parse-temp");
  await mkdir(tempDir, { recursive: true });

  const slices: string[] = [];

  for (let i = 0; i < splitCount; i++) {
    const top = Math.max(0, (i * splitHeight - overlapHeight));
    const cropHeight = Math.min(splitHeight + 2 * overlapHeight, height - top);
    const outputPath = join(tempDir, `slice_${i}.png`);

    await sharp(options.imagePath)
      .extract({ left: 0, top, width, height: cropHeight })
      .png()
      .toFile(outputPath);

    slices.push(outputPath);
  }

  const cleanup = async () => {
    for (const slice of slices) {
      await unlink(slice).catch(() => {});
    }
  };

  return {
    needsSlicing: true,
    images: slices,
    maxPixels: maxPixels,
    originalDimensions: { width, height, pixels },
    cleanup
  };
}
