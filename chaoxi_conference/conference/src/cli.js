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
    options: { user: { type: "string", short: "u" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = requireBind(callerUser);

  const presId = positionals[0];
  if (!presId) outputError("缺少 presentationId", "用法: cx-conference use-presentation <presId> --user <id>");

  const result = await cache.usePresentation(bind.conferenceId, presId);
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
    presentation: safeMeta,
    hasIntro: !!data.intro,
    hasContent: !!data.content,
    hasScript: !!data.script,
    hasSummary: !!data.summary,
    contentLength: data.content?.length ?? 0,
    scriptLength: data.script?.length ?? 0,
  });
}

// ─── Auto Command ────────────────────────────────────

/**
 * auto — 一键获取会议数据
 *
 * 自动检测状态，缺什么补什么：
 * 1. 未登录/过期 → 返回 needLogin，AI 引导登录
 * 2. 未绑定 → 列出会议（只有一个自动绑定）
 * 3. --rebind → 强制重新选择会议
 * 4. --refresh → 强制刷新缓存
 * 5. 已就绪 → 返回演讲列表
 */
async function handleAuto(args) {
  const { values } = parseArgs({
    args,
    options: {
      user: { type: "string", short: "u" },
      rebind: { type: "boolean", short: "r" },
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

  // 2. 换绑：--rebind 清除旧绑定
  if (values.rebind) {
    auth.clearBind(callerUser);
  }

  // 3. 检查绑定
  let bind = auth.getBind(callerUser);
  if (!bind) {
    const result = await auth.listConference(callerUser);
    if (!result.ok || !result.conferences?.length) {
      return output({ step: "noConference", message: "没有可用的会议" });
    }
    // 只有一个会议，自动绑定
    if (result.conferences.length === 1) {
      const conf = result.conferences[0];
      const confId = conf.objectId || conf.id || conf.conferenceId;
      auth.writeBind(callerUser, { conferenceId: confId, boundAt: Date.now() });
      bind = { conferenceId: confId, boundAt: Date.now() };
    } else {
      return output({
        step: "needBind",
        message: "请选择会议",
        conferences: result.conferences,
        next: `{skill-folder}/cx-conference bind-conference <confId> --user ${callerUser}`,
      });
    }
  }

  // 4. 加载数据（--refresh 强制重新拉取）
  let catalog = values.refresh ? null : cache.useConference(bind.conferenceId);
  if (!catalog) {
    const catalogResult = await auth.loadConferenceCatalog(callerUser, bind.conferenceId);
    if (!catalogResult.ok) {
      return output({ step: "error", message: catalogResult.message });
    }
    await cache.loadConference(bind.conferenceId, catalogResult.presentations || []);
    catalog = catalogResult.presentations || [];
  }

  // 5. 返回数据
  return output({
    step: "ready",
    message: "会议数据已就绪",
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
    tip: "使用 use-presentation <presId> --user <id> 查看演讲详情",
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
    default:                    outputError(`未知命令: ${command}`, "支持: auto, login, verify, check, me, logout, list-conference, bind-conference, load-conference, use-conference, use-presentation");
  }
}

main().catch((err) => {
  outputError(`内部错误: ${err.message}`);
});
