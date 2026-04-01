/**
 * 缓存管理模块
 *
 * 目录结构:
 *   [skill]/data/{conferenceId}/
 *     catalog.json                    # 会议目录（演讲列表）
 *     cache-meta.json                 # 缓存元信息（过期策略等）
 *     {presentationId}/
 *       intro.yaml                    # 幻灯片级元数据
 *       content.txt                   # 逐页PPT内容
 *       script.txt                    # 演讲稿
 *       summary.txt                   # 总结
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { config } from "./config.js";

// ─── Paths ───────────────────────────────────────────

const SKILL_DIR = resolve(import.meta.dirname, "..");
const DATA_DIR = resolve(SKILL_DIR, "data");

function confDir(conferenceId) {
  return resolve(DATA_DIR, conferenceId);
}

function presDir(conferenceId, presentationId) {
  return resolve(confDir(conferenceId), presentationId);
}

function catalogPath(conferenceId) {
  return resolve(confDir(conferenceId), "catalog.json");
}

function cacheMetaPath(conferenceId) {
  return resolve(confDir(conferenceId), "cache-meta.json");
}

// ─── I/O Helpers ─────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readJson(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf-8")); }
  catch { return null; }
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Live Detection ──────────────────────────────────

/** 判断会议是否正在进行中（任一演讲在 24 小时内开始） */
function isConferenceLive(presentations) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return presentations.some((p) => {
    const start = new Date(p.planStart).getTime();
    return Math.abs(now - start) < oneDay;
  });
}

// ─── Download ────────────────────────────────────────

async function downloadText(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function writeFile(path, content) {
  writeFileSync(path, content, "utf-8");
}

/** 下载单个演讲的全部远程数据 */
async function downloadPresentation(conferenceId, p) {
  const dir = presDir(conferenceId, p.objectId);
  ensureDir(dir);

  const tasks = [];

  if (p.intro) {
    tasks.push(downloadText(p.intro).then((d) => { if (d) writeFile(join(dir, "intro.yaml"), d); }));
  }
  if (p.content) {
    tasks.push(downloadText(p.content).then((d) => { if (d) writeFile(join(dir, "content.txt"), d); }));
  }
  if (p.script) {
    tasks.push(downloadText(p.script).then((d) => { if (d) writeFile(join(dir, "script.txt"), d); }));
  }
  if (p.summary) {
    tasks.push(downloadText(p.summary).then((d) => { if (d) writeFile(join(dir, "summary.txt"), d); }));
  }

  await Promise.all(tasks);
  return true;
}

// ─── Public API ──────────────────────────────────────

/**
 * 加载会议数据到缓存
 *
 * 策略:
 * - 进行中的会议: 只缓存 catalog，不下载远程数据（每次调用都会刷新）
 * - 已结束的会议: 缓存 catalog + 下载全部远程数据（仅首次）
 */
export async function loadConference(conferenceId, presentations) {
  const dir = confDir(conferenceId);
  ensureDir(dir);

  const live = isConferenceLive(presentations);

  // 写入 catalog
  writeJson(catalogPath(conferenceId), presentations);

  // 读取已有的缓存元信息
  const meta = readJson(cacheMetaPath(conferenceId)) || {
    conferenceId,
    loadedAt: Date.now(),
    isLive: live,
    presentations: {},
  };

  meta.loadedAt = Date.now();
  meta.isLive = live;
  meta.lastPollAt = Date.now();

  let cached = 0;

  if (!live) {
    // 已结束会议：下载全部远程数据（仅首次）
    for (const p of presentations) {
      const pmeta = meta.presentations[p.objectId];
      if (!pmeta?.downloaded) {
        await downloadPresentation(conferenceId, p);
        meta.presentations[p.objectId] = { downloaded: true, downloadedAt: Date.now() };
        cached++;
      }
    }
  }

  writeJson(cacheMetaPath(conferenceId), meta);
  return {
    ok: true,
    message: live
      ? "会议进行中，已缓存目录（远程数据按需下载）"
      : `已缓存 ${cached > 0 ? cached + ' 个新演讲' : '全部数据（无更新）'}`,
    cached,
  };
}

/** 获取缓存的会议目录 */
export function useConference(conferenceId) {
  return readJson(catalogPath(conferenceId));
}

/** 获取缓存元信息 */
export function getCacheMeta(conferenceId) {
  return readJson(cacheMetaPath(conferenceId));
}

/**
 * 使用单个演讲数据
 *
 * 按需下载：如果本地没有缓存，从远程拉取
 */
export async function usePresentation(conferenceId, presentationId) {
  const catalog = readJson(catalogPath(conferenceId));
  if (!catalog) return { ok: false, message: "会议目录未加载，请先执行 load-conference" };

  const p = catalog.find((x) => x.objectId === presentationId);
  if (!p) return { ok: false, message: `演讲 ${presentationId} 不存在` };

  const dir = presDir(conferenceId, presentationId);

  // 按需下载：intro/content/script/summary 哪个缺就下哪个
  const ensureFile = async (remoteUrl, filename) => {
    if (!remoteUrl) return null;
    const local = join(dir, filename);
    if (existsSync(local)) return readFileSync(local, "utf-8");
    ensureDir(dir);
    const text = await downloadText(remoteUrl);
    if (text) writeFile(local, text);
    return text;
  };

  const [intro, content, script, summary] = await Promise.all([
    ensureFile(p.intro, "intro.yaml"),
    ensureFile(p.content, "content.txt"),
    ensureFile(p.script, "script.txt"),
    ensureFile(p.summary, "summary.txt"),
  ]);

  return {
    ok: true,
    message: "加载成功",
    data: {
      meta: p,
      intro,
      content,
      script,
      summary,
    },
  };
}

// ─── Cross-Conference Search ─────────────────────────

/** 获取所有已缓存的会议目录 */
export function listCachedConferences() {
  if (!existsSync(DATA_DIR)) return [];
  const entries = readdirSync(DATA_DIR, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const catalog = readJson(catalogPath(entry.name));
    if (catalog) {
      result.push({ conferenceId: entry.name, presentationCount: catalog.length });
    }
  }
  return result;
}

/** 跨所有缓存会议搜索关键词 */
export function searchAllCatalogs(keyword) {
  if (!existsSync(DATA_DIR)) return [];
  const kw = keyword.toLowerCase();
  const results = [];
  const entries = readdirSync(DATA_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const catalog = readJson(catalogPath(entry.name));
    if (!catalog) continue;

    for (const p of catalog) {
      const searchText = [
        p.title, p.speakerName, p.speakerTitle,
        p.abstract, p.forum, p.keywords,
      ].filter(Boolean).join(" ").toLowerCase();

      if (searchText.includes(kw)) {
        results.push({
          conferenceId: entry.name,
          presentationId: p.objectId,
          title: p.title,
          speakerName: p.speakerName,
          speakerTitle: p.speakerTitle,
          forum: p.forum,
          abstract: p.abstract?.substring(0, 200),
          status: p.status,
        });
      }
    }
  }

  return results;
}

/** 在所有会议中查找某个演讲（用于 use-presentation 跨会议查找） */
export function findPresentation(presId) {
  if (!existsSync(DATA_DIR)) return null;
  const entries = readdirSync(DATA_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const catalog = readJson(catalogPath(entry.name));
    if (!catalog) continue;
    const p = catalog.find((x) => x.objectId === presId);
    if (p) return { conferenceId: entry.name, presentation: p };
  }

  return null;
}
