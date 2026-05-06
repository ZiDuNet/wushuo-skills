/**
 * 配置加载模块
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const CONFIG_PATH = join(import.meta.dirname, "..", "config.json");

export const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
