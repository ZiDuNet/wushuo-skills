#!/usr/bin/env node
/**
 * cx-conference CLI — 认证与会议操作
 *
 * 认证:
 *   cx-conference login  --user <caller> --mobile <phone>
 *   cx-conference verify --user <caller> --code <code>
 *   cx-conference check  --user <caller>
 *   cx-conference me     --user <caller>
 *   cx-conference logout --user <caller>
 *
 * 会议:
 *   cx-conference list-conference            --user <caller>
 *   cx-conference bind-conference <confId>   --user <caller>
 *   cx-conference load-conference            --user <caller>
 */

import { parseArgs } from "node:util";
import * as auth from "./auth.js";
import * as cache from "./cache.js";

const HELP = `
cx-conference — 会议技能工具

一键操作:
  cx-conference auto --user <id>              自动检测状态，返回会议数据

认证:
  cx-conference login  --user <id> --mobile <phone>   发送短信验证码
  cx-conference verify --user <id> --code <code>       验证码登录
  cx-conference check  --user <id>                     检查登录状态
  cx-conference me     --user <id>                     查看用户信息
  cx-conference logout --user <id>                     登出

会议:
  cx-conference list-conference            列出可用会议
  cx-conference bind-conference <confId>   绑定会议
  cx-conference load-conference            加载会议目录到缓存
  cx-conference use-conference             查看缓存的会议目录
  cx-conference use-presentation <presId>  查看演讲数据（按需下载）

  --user 是调用者的用户标识，不同调用者 token / 绑定互不可见。

输出格式: JSON
`;

// ─── Output helpers ──────────────────────────────────

function output(data) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

function outputError(message, details) {
  console.log(JSON.stringify({ ok: false, error: message, details }, null, 2));
  process.exit(1);
}

function requireUser(values) {
  if (!values.user) outputError("缺少 --user 参数", "用法: cx-conference <command> --user <caller_user_id>");
  return values.user;
}

/** 确保已登录且 token 未过期 */
function requireAuth(callerUser) {
  const status = auth.check(callerUser);
  if (!status.loggedIn) outputError("未登录", "请先执行: cx-conference login --user <id> --mobile <phone>");
  if (status.expired) outputError("登录已过期", "请重新执行 login");
  return status.data;
}

/** 确保已绑定会议 */
function requireBind(callerUser) {
  const bind = auth.getBind(callerUser);
  if (!bind) outputError("未绑定会议", "请先执行: cx-conference bind-conference <confId> --user <id>");
  return bind;
}

// ─── Auth Command Handlers ───────────────────────────

async function handleLogin(args) {
  const { values } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" }, mobile: { type: "string", short: "m" } },
    strict: true,
  });
  const callerUser = requireUser(values);
  if (!values.mobile) outputError("缺少 --mobile 参数");
  const result = await auth.login(callerUser, values.mobile);
  output({ ok: result.ok, message: result.message });
}

async function handleVerify(args) {
  const { values } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" }, code: { type: "string", short: "c" } },
    strict: true,
  });
  const callerUser = requireUser(values);
  if (!values.code) outputError("缺少 --code 参数");
  const result = await auth.verify(callerUser, values.code);
  if (result.ok && result.data) {
    const { jwt: _, ...safe } = result.data;
    output({ ok: true, message: result.message, user: { ...safe, tokenSaved: true } });
  } else {
    output({ ok: false, message: result.message });
  }
}

function handleCheck(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  const status = auth.check(callerUser);
  if (!status.loggedIn) return output({ loggedIn: false, message: "未登录" });
  return output({
    loggedIn: true,
    expired: status.expired,
    user: {
      userId: status.data.userId,
      mobile: status.data.mobile,
      role: status.data.role,
      exp: new Date(status.data.exp * 1000).toISOString(),
    },
  });
}

function handleMe(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  const user = auth.me(callerUser);
  if (!user) return output({ loggedIn: false, message: "未登录" });
  return output({
    loggedIn: true,
    user: {
      userId: user.userId,
      mobile: user.mobile,
      role: user.role,
      iat: new Date(user.iat * 1000).toISOString(),
      exp: new Date(user.exp * 1000).toISOString(),
    },
  });
}

function handleLogout(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  auth.clearBind(callerUser);
  const result = auth.logout(callerUser);
  output({ ok: result.ok, message: result.message });
}

// ─── Conference Command Handlers ─────────────────────

async function handleListConference(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  const result = await auth.listConference(callerUser);
  if (result.ok) {
    output({ ok: true, message: result.message, conferences: result.conferences });
  } else {
    output({ ok: false, message: result.message });
  }
}

async function handleBindConference(args) {
  const { values, positionals } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  // 直接传了会议 ID，绑定
  const confId = positionals[0];
  if (confId) {
    auth.writeBind(callerUser, { conferenceId: confId, boundAt: Date.now() });
    return output({ ok: true, message: `已绑定会议 ${confId}`, bind: { conferenceId: confId } });
  }

  // 没传会议 ID → 查询列表让用户选择
  const result = await auth.listConference(callerUser);
  if (!result.ok || !result.conferences?.length) {
    return output({ ok: false, message: result.message || "没有可用的会议" });
  }

  return output({
    ok: true,
    message: "请选择要绑定的会议（重新执行并传入会议 ID）",
    conferences: result.conferences,
    usage: `cx-conference bind-conference <confId> --user ${callerUser}`,
  });
}

async function handleLoadConference(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = requireBind(callerUser);

  // 从 API 获取会议目录
  const catalogResult = await auth.loadConferenceCatalog(callerUser, bind.conferenceId);

  // 缓存到磁盘
  const cacheResult = await cache.loadConference(bind.conferenceId, catalogResult.presentations || []);

  output({
    ok: true,
    conferenceId: bind.conferenceId,
    presentations: (catalogResult.presentations || []).map((p) => ({
      objectId: p.objectId,
      title: p.title,
      speakerName: p.speakerName,
      status: p.status,
      slideCount: p.slideCount,
      planStart: p.planStart,
    })),
    cache: cacheResult.message,
  });
}

function handleUseConference(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = requireBind(callerUser);

  const catalog = cache.useConference(bind.conferenceId);
  if (!catalog) {
    return output({ ok: false, message: "会议目录未加载，请先执行 load-conference" });
  }

  return output({
    ok: true,
    conferenceId: bind.conferenceId,
    totalPresentations: catalog.length,
    presentations: catalog.map((p) => ({
      objectId: p.objectId,
      title: p.title,
      speakerName: p.speakerName,
      speakerTitle: p.speakerTitle,
      forum: p.forum,
      status: p.status,
      slideCount: p.slideCount,
      planStart: p.planStart,
      abstract: p.abstract,
    })),
  });
}

async function handleUsePresentation(args) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      user: { type: "string", short: "u" },
      conf: { type: "string", short: "c" },
    },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  const presId = positionals[0];
  if (!presId) outputError("缺少 presentationId", "用法: cx-conference use-presentation <presId> --conf <confId> --user <id>");

  // 确定会议 ID：优先用 --conf，否则在所有缓存中查找
  let conferenceId = values.conf;
  if (!conferenceId) {
    const found = cache.findPresentation(presId);
    if (!found) outputError("未找到该演讲", "请先执行 auto 加载会议数据，或用 --conf 指定会议 ID");
    conferenceId = found.conferenceId;
  }

  const result = await cache.usePresentation(conferenceId, presId);
  if (!result.ok || !result.data) {
    return output({ ok: false, message: result.message });
  }

  // 不输出远程 URL 和 JWT 等内部字段
  const { meta, ...data } = result.data;
  const safeMeta = { ...meta };
  delete safeMeta.intro;
  delete safeMeta.content;
  delete safeMeta.script;
  delete safeMeta.summary;

  output({
    ok: true,
    conferenceId,
    presentation: safeMeta,
    hasIntro: !!data.intro,
    hasContent: !!data.content,
    hasScript: !!data.script,
    hasSummary: !!data.summary,
    contentLength: data.content?.length ?? 0,
    scriptLength: data.script?.length ?? 0,
    validatedImages: data.validatedImages ?? [],
  });
}

// ─── Search Command ──────────────────────────────────

/**
 * search — 跨所有会议搜索关键词
 *
 * 在标题、演讲者、摘要、论坛等字段中搜索
 */
async function handleSearch(args) {
  const { values, positionals } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  const keyword = positionals[0];
  if (!keyword) outputError("缺少搜索关键词", "用法: cx-conference search <关键词> --user <id>");

  const results = cache.searchAllCatalogs(keyword);

  return output({
    ok: true,
    keyword,
    totalMatches: results.length,
    matches: results,
    tip: results.length > 0
      ? `使用 use-presentation <presId> --conf <confId> --user ${callerUser} 查看详情`
      : "没有匹配结果，请尝试其他关键词",
  });
}

// ─── Auto Command ────────────────────────────────────

/**
 * auto — 一键获取所有会议数据
 *
 * 自动检测状态，缺什么补什么：
 * 1. 未登录/过期 → 返回 needLogin，AI 引导登录
 * 2. 拉取所有会议列表，加载并缓存每个会议的目录
 * 3. --refresh → 强制刷新所有缓存
 * 4. 已就绪 → 返回所有会议和演讲列表
 */
async function handleAuto(args) {
  const { values } = parseArgs({
    args,
    options: {
      user: { type: "string", short: "u" },
      refresh: { type: "boolean", short: "f" },
    },
    strict: true,
  });
  const callerUser = requireUser(values);

  // 1. 检查登录
  const loginStatus = auth.check(callerUser);
  if (!loginStatus.loggedIn || loginStatus.expired) {
    return output({
      step: "needLogin",
      message: loginStatus.expired ? "登录已过期，需要重新登录" : "未登录",
      next: [
        `AskUserQuestion → "请输入手机号"`,
        `{skill-folder}/cx-conference login --user ${callerUser} --mobile <手机号>`,
        `AskUserQuestion → "请输入验证码"`,
        `{skill-folder}/cx-conference verify --user ${callerUser} --code <验证码>`,
        `重新执行 auto`,
      ],
    });
  }

  // 2. 拉取所有会议列表
  const result = await auth.listConference(callerUser);
  if (!result.ok || !result.conferences?.length) {
    return output({ step: "noConference", message: "没有可用的会议" });
  }

  // 3. 加载并缓存每个会议的目录
  const allConferences = [];
  const loadingLog = [];
  const total = result.conferences.length;
  for (let i = 0; i < total; i++) {
    const conf = result.conferences[i];
    const confId = conf.objectId || conf.id || conf.conferenceId;
    const confName = conf.name || conf.title || confId;

    // 优先用缓存，--refresh 时强制重新拉取
    let catalog = values.refresh ? null : cache.useConference(confId);
    if (!catalog) {
      const logMsg = `[${i + 1}/${total}] 正在获取: ${confName} ...`;
      loadingLog.push(logMsg);
      process.stderr.write(logMsg + "\n");
      const catalogResult = await auth.loadConferenceCatalog(callerUser, confId);
      if (catalogResult.ok) {
        await cache.loadConference(confId, catalogResult.presentations || []);
        catalog = catalogResult.presentations || [];
        const doneMsg = `[${i + 1}/${total}] ✓ ${confName}（${catalog.length} 个演讲）`;
        loadingLog.push(doneMsg);
        process.stderr.write(doneMsg + "\n");
      } else {
        catalog = [];
        const failMsg = `[${i + 1}/${total}] ✗ ${confName} 加载失败: ${catalogResult.message}`;
        loadingLog.push(failMsg);
        process.stderr.write(failMsg + "\n");
      }
    } else {
      const cacheMsg = `[${i + 1}/${total}] 已缓存: ${confName}（${catalog.length} 个演讲）`;
      loadingLog.push(cacheMsg);
      process.stderr.write(cacheMsg + "\n");
    }

    allConferences.push({
      conferenceId: confId,
      conferenceName: confName,
      totalPresentations: catalog.length,
      presentations: catalog.map((p) => ({
        objectId: p.objectId,
        title: p.title,
        speakerName: p.speakerName,
        speakerTitle: p.speakerTitle,
        forum: p.forum,
        status: p.status,
        slideCount: p.slideCount,
        planStart: p.planStart,
        abstract: p.abstract,
      })),
    });
  }

  // 4. 返回所有数据
  const totalPres = allConferences.reduce((sum, c) => sum + c.totalPresentations, 0);
  return output({
    step: "ready",
    message: `所有会议数据已就绪（${allConferences.length} 个会议，${totalPres} 个演讲）`,
    totalConferences: allConferences.length,
    loadingLog,
    totalPresentations: totalPres,
    conferences: allConferences,
    tip: "使用 search <关键词> 搜索，或 use-presentation <presId> --user <id> 查看详情",
  });
}

// ─── Main ────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    process.exit(0);
  }

  const rest = args.slice(1);

  switch (command) {
    case "auto":                return handleAuto(rest);
    case "login":               return handleLogin(rest);
    case "verify":              return handleVerify(rest);
    case "check":               return handleCheck(rest);
    case "me":                  return handleMe(rest);
    case "logout":              return handleLogout(rest);
    case "list-conference":     return handleListConference(rest);
    case "bind-conference":     return handleBindConference(rest);
    case "load-conference":     return handleLoadConference(rest);
    case "use-conference":      return handleUseConference(rest);
    case "use-presentation":    return handleUsePresentation(rest);
    case "search":              return handleSearch(rest);
    default:                    outputError(`未知命令: ${command}`, "支持: auto, login, verify, check, me, logout, list-conference, bind-conference, load-conference, use-conference, use-presentation, search");
  }
}

main().catch((err) => {
  outputError(`内部错误: ${err.message}`);
});
