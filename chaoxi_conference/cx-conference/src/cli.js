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
 *   cx-conference auto                                快速获取会议列表（不加载目录）
 *   cx-conference load-catalog --conf <id>           加载指定会议目录
 *   cx-conference load-catalog --all                 加载全部会议目录
 *   cx-conference use-presentation <presId>          查看演讲数据（按需下载）
 *   cx-conference list-conference                    列出可用会议
 *   cx-conference bind-conference <confId>           绑定会议
 *   cx-conference load-conference                    加载会议目录到缓存
 *   cx-conference use-conference                     查看缓存的会议目录
 */

import { parseArgs } from "node:util";
import * as auth from "./auth.js";
import * as cache from "./cache.js";

const HELP = `
cx-conference — 会议技能工具

一键操作:
  cx-conference auto --user <id>                             快速获取会议列表
  cx-conference load-catalog --conf <id> --user <id>         加载指定会议目录
  cx-conference load-catalog --all --user <id>               加载全部会议目录
  cx-conference use-presentation <presId> --conf <id> --user <id>  查看演讲详情

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

  --user 是调用者的用户标识，不同调用者 token / 绑定互不可见。

输出格式: JSON
`;

// ─── Output helpers ──────────────────────────────────

function output(data) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

function outputError(message, details, suggestion) {
  console.log(JSON.stringify({ ok: false, error: message, details, suggestion }, null, 2));
  process.exit(1);
}

function requireUser(values) {
  if (!values.user) outputError("缺少 --user 参数", "用法: cx-conference <command> --user <caller_user_id>");
  return values.user;
}

/** 确保已登录且 token 未过期 */
function requireAuth(callerUser) {
  const status = auth.check(callerUser);
  if (!status.loggedIn) outputError("未登录", `用户 ${callerUser} 没有有效的登录凭证`, "请先执行 auto 命令开始登录流程");
  if (status.expired) outputError("登录已过期", `用户 ${callerUser} 的 token 已过期`, "请重新执行 auto 命令重新登录");
}

// ─── Auth Command Handlers ─────────────────────────────

async function handleLogin(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" }, mobile: { type: "string", short: "m" } }, strict: true });
  const callerUser = requireUser(values);
  if (!values.mobile) outputError("缺少 --mobile 参数", "用法: cx-conference login --user <id> --mobile <手机号>");
  const result = await auth.login(callerUser, values.mobile);
  output(result);
}

async function handleVerify(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" }, code: { type: "string", short: "c" } }, strict: true });
  const callerUser = requireUser(values);
  if (!values.code) outputError("缺少 --code 参数", "用法: cx-conference verify --user <id> --code <验证码>");
  const result = await auth.verify(callerUser, values.code);
  output(result);
}

async function handleCheck(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  output(auth.check(callerUser));
}

async function handleMe(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  const info = auth.me(callerUser);
  if (!info) outputError("未登录");
  output(info);
}

async function handleLogout(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  output(auth.logout(callerUser));
}

// ─── Conference Command Handlers ───────────────────────

async function handleListConference(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  output(await auth.listConference(callerUser));
}

async function handleBindConference(args) {
  const { values, positionals } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, allowPositionals: true, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const confId = positionals[0];
  if (!confId) outputError("缺少会议 ID", "用法: cx-conference bind-conference <confId> --user <id>");
  auth.writeBind(callerUser, { conferenceId: confId, boundAt: Date.now() });
  output({ ok: true, message: `已绑定会议 ${confId}` });
}

async function handleLoadConference(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = auth.getBind(callerUser);
  if (!bind) outputError("未绑定会议", "请先 bind-conference <confId> --user <id>");
  const catalogResult = await auth.loadConferenceCatalog(callerUser, bind.conferenceId);
  if (!catalogResult.ok) outputError("加载失败", catalogResult.message);
  await cache.loadConference(bind.conferenceId, catalogResult.presentations || []);
  output({
    ok: true,
    message: "加载成功",
    conferenceId: bind.conferenceId,
    presentationCount: catalogResult.presentations.length,
  });
}

async function handleUseConference(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  const bind = auth.getBind(callerUser);
  if (!bind) outputError("未绑定会议");
  const catalog = cache.useConference(bind.conferenceId);
  if (!catalog) outputError("会议目录未加载", "请先执行 load-conference");
  output({ ok: true, conferenceId: bind.conferenceId, presentations: catalog });
}

async function handleUsePresentation(args) {
  const { values, positionals } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" }, conf: { type: "string", short: "c" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  const presId = positionals[0];
  if (!presId) outputError("缺少演讲 ID", "用法: cx-conference use-presentation <presId> --conf <confId> --user <id>");

  // 如果指定了 conf，直接用；否则跨会议查找
  const confId = values.conf || cache.findPresentation(presId)?.conferenceId;
  if (!confId) outputError(`演讲 ${presId} 不存在`, "请确认 presId 正确，或通过 load-catalog 先加载会议目录");

  // 进行中的会议：自动刷新 catalog（演讲可能在更新）
  if (cache.isConferenceLiveCached(confId)) {
    process.stderr.write(`会议进行中，正在刷新目录...\n`);
    const catalogResult = await auth.loadConferenceCatalog(callerUser, confId);
    if (catalogResult.ok) {
      await cache.loadConference(confId, catalogResult.presentations || []);
      process.stderr.write(`目录已刷新\n`);
    }
  }

  const result = await cache.usePresentation(confId, presId);
  if (!result.ok) outputError(result.message);
  output({ ...result, conferenceId: confId });
}

// ─── Auto Command (只返回会议列表) ────────────────────

async function handleAuto(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);

  // 1. 检查登录
  const loginStatus = auth.check(callerUser);
  if (!loginStatus.loggedIn || loginStatus.expired) {
    return output({
      step: "needLogin",
      message: loginStatus.expired ? "登录已过期，需要重新登录" : "未登录",
      next: [
        `AskUserQuestion → "请输入手机号"`,
        `node {skill-folder}/src/cli.js login --user ${callerUser} --mobile <手机号>`,
        `AskUserQuestion → "请输入验证码"`,
        `node {skill-folder}/src/cli.js verify --user ${callerUser} --code <验证码>`,
        `重新执行 auto`,
      ],
    });
  }

  // 2. 只拉取会议列表（轻量，秒回）
  const result = await auth.listConference(callerUser);
  if (!result.ok || !result.conferences?.length) {
    return output({ step: "noConference", message: "没有可用的会议" });
  }

  const conferences = result.conferences.map((c) => ({
    conferenceId: c.objectId || c.id || c.conferenceId,
    conferenceName: c.name || c.title || c.objectId,
  }));

  return output({
    step: "selectConference",
    message: `发现 ${conferences.length} 个会议，请问您想查看哪个会议的数据？`,
    conferences,
    tip: "将会议列表展示给用户选择。用户选择后执行 load-catalog --conf <confId> --user <id> 加载该会议目录；如需全部加载，执行 load-catalog --all --user <id>",
  });
}

// ─── Load Catalog Command (按需加载目录) ──────────────

async function handleLoadCatalog(args) {
  const { values } = parseArgs({
    args,
    options: {
      user: { type: "string", short: "u" },
      conf: { type: "string", short: "c" },
      all: { type: "boolean", short: "a" },
      refresh: { type: "boolean", short: "f" },
    },
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  if (!values.conf && !values.all) {
    outputError("请指定 --conf <confId> 或 --all", "load-catalog --conf <confId> --user <id>  加载指定会议\nload-catalog --all --user <id>          加载全部会议");
  }

  // 获取会议列表
  const listResult = await auth.listConference(callerUser);
  if (!listResult.ok || !listResult.conferences?.length) {
    outputError("没有可用的会议");
  }

  // 确定要加载的会议
  let targetConfs;
  if (values.all) {
    targetConfs = listResult.conferences;
  } else {
    const found = listResult.conferences.find(
      (c) => (c.objectId || c.id || c.conferenceId) === values.conf
    );
    if (!found) {
      const available = listResult.conferences.map((c) => c.objectId || c.id || c.conferenceId).join(", ");
      outputError(`会议 ${values.conf} 不存在`, `可用会议: ${available}`);
    }
    targetConfs = [found];
  }

  // 逐个加载
  const results = [];
  const total = targetConfs.length;

  for (let i = 0; i < total; i++) {
    const conf = targetConfs[i];
    const confId = conf.objectId || conf.id || conf.conferenceId;
    const confName = conf.name || conf.title || confId;

    // 优先用缓存
    let catalog = values.refresh ? null : cache.useConference(confId);
    if (!catalog) {
      process.stderr.write(`[${i + 1}/${total}] 正在获取: ${confName} ...\n`);
      const catalogResult = await auth.loadConferenceCatalog(callerUser, confId);
      if (catalogResult.ok) {
        await cache.loadConference(confId, catalogResult.presentations || []);
        catalog = catalogResult.presentations || [];
        process.stderr.write(`[${i + 1}/${total}] ✓ ${confName}（${catalog.length} 个演讲）\n`);
      } else {
        process.stderr.write(`[${i + 1}/${total}] ✗ ${confName} 加载失败\n`);
        results.push({ conferenceId: confId, conferenceName: confName, ok: false, message: catalogResult.message });
        continue;
      }
    } else {
      process.stderr.write(`[${i + 1}/${total}] 已缓存: ${confName}（${catalog.length} 个演讲）\n`);
    }

    results.push({
      conferenceId: confId,
      conferenceName: confName,
      ok: true,
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

  const totalPres = results.reduce((sum, c) => sum + (c.totalPresentations || 0), 0);
  return output({
    ok: true,
    step: "ready",
    message: `已加载 ${results.length} 个会议，共 ${totalPres} 个演讲`,
    conferences: results,
    totalPresentations: totalPres,
    tip: "浏览 presentations 找到感兴趣的演讲，使用 use-presentation <presId> --conf <confId> --user <id> 查看详情",
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
    case "load-catalog":        return handleLoadCatalog(rest);
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
    default:                    outputError(`未知命令: ${command}`, "支持: auto, load-catalog, login, verify, check, me, logout, list-conference, bind-conference, load-conference, use-conference, use-presentation");
  }
}

main().catch((err) => {
  outputError(`内部错误: ${err.message}`);
});
