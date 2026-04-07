/**
 * 配置加载模块
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_PATH = join(__dirname, "..", "config.json");

export const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
