#!/usr/bin/env bun
/**
 * cx-screen CLI — 多用户认证 + 屏幕管理
 *
 * 认证:
 *   cx-screen login  --user <caller> --mobile <phone>
 *   cx-screen verify --user <caller> --code <code>
 *   cx-screen check  --user <caller>
 *   cx-screen me     --user <caller>
 *   cx-screen logout --user <caller>
 *
 * 屏幕:
 *   cx-screen list-screen             --user <caller>
 *   cx-screen bind-screen <screenId>  --user <caller>
 *   cx-screen play-image <filePath>   --user <caller>
 *   cx-screen play-html <filePath>    --user <caller>
 *   cx-screen screenshot              --user <caller>
 */

import { parseArgs } from "node:util";
import * as auth from "./auth.js";

const HELP = `
cx-screen — 多用户认证 + 屏幕管理工具

认证:
  cx-screen login  --user <id> --mobile <phone>   发送短信验证码
  cx-screen verify --user <id> --code <code>      验证码登录
  cx-screen check  --user <id>                    检查登录状态
  cx-screen me     --user <id>                    查看用户信息
  cx-screen logout --user <id>                    登出

屏幕 (需先 login + bind-screen):
  cx-screen list-screen            列出可用屏幕
  cx-screen bind-screen <screenId> 绑定屏幕
  cx-screen play-image <filePath>  投放图片
  cx-screen play-html <filePath>   投放 HTML
  cx-screen screenshot             查询屏幕快照

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
  if (!values.user) outputError("缺少 --user 参数", "用法: cx-screen <command> --user <caller_user_id>");
  return values.user;
}

/** 确保已登录且 token 未过期 */
function requireAuth(callerUser) {
  const status = auth.check(callerUser);
  if (!status.loggedIn) outputError("未登录", "请先执行: cx-screen login --user <id> --mobile <phone>");
  if (status.expired) outputError("登录已过期", "请重新执行 login");
  return status.data;
}

/** 确保已绑定屏幕 */
function requireBind(callerUser) {
  const bind = auth.getBind(callerUser);
  if (!bind) outputError("未绑定屏幕", "请先执行: cx-screen bind-screen <screenId> --user <id>");
  return bind;
}

// ─── Command Handlers ────────────────────────────────

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
    const { jwt: _jwt, ...safe } = result.data;
    output({ ok: true, message: result.message, user: { ...safe, tokenSaved: true } });
  } else {
    output({ ok: false, message: result.message });
  }
}

function handleCheck(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  const status = auth.check(callerUser);
  if (!status.loggedIn) output({ loggedIn: false, message: "未登录" });
  output({
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
  if (!user) output({ loggedIn: false, message: "未登录" });
  output({
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
  const result = auth.logout(callerUser);
  output({ ok: result.ok, message: result.message });
}

// ─── Screen Commands ─────────────────────────────────

async function handleListScreen(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  const result = await auth.listScreen(callerUser);
  if (result.ok) {
    output({ ok: true, message: result.message, screens: result.screens });
  } else {
    output({ ok: false, message: result.message });
  }
}

async function handleBindScreen(args) {
  const { values, positionals } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);

  // 获取屏幕列表（用于查询 direction）
  const result = await auth.listScreen(callerUser);

  // 如果直接传了 screenId，直接绑定
  const screenId = positionals[0];
  if (screenId) {
    const screen = result.screens?.find((s) => s.sn === screenId);
    const direction = screen?.direction || "竖屏";
    auth.writeBind(callerUser, { screenId, direction, boundAt: Date.now() });
    output({ ok: true, message: `已绑定屏幕 ${screenId}`, bind: { screenId, direction } });
  }

  // 没传 screenId → 查询列表让用户选择
  if (!result.ok || !result.screens?.length) {
    output({ ok: false, message: result.message || "没有可用的屏幕" });
  }

  output({
    ok: true,
    message: "请选择要绑定的屏幕（重新执行并传入 sn）",
    screens: result.screens.map((screen) => ({ sn: screen.sn, name: screen.name, direction: screen.direction })),
    usage: `cx-screen bind-screen <sn> --user ${callerUser}`,
  });
}

async function handlePlayImage(args) {
  const { values, positionals } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = requireBind(callerUser);

  const filePath = positionals[0];
  if (!filePath) outputError("缺少 filePath 参数", "用法: cx-screen play-image <filePath> --user <id>");

  const result = await auth.playImage(callerUser, filePath);
  output({ ok: result.ok, message: result.message, screenId: bind.screenId });
}

function handlePlayHtml(args) {
  const { values, positionals } = parseArgs({
    args,
    options: { user: { type: "string", short: "u" } },
    allowPositionals: true,
    strict: true,
  });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = requireBind(callerUser);

  const filePath = positionals[0];
  if (!filePath) outputError("缺少 filePath 参数", "用法: cx-screen play-html <filePath> --user <id>");

  // TODO: 调用 API 投放 HTML
  output({ ok: true, message: "TODO: play-html", screenId: bind.screenId, filePath });
}

function handleScreenshot(args) {
  const { values } = parseArgs({ args, options: { user: { type: "string", short: "u" } }, strict: true });
  const callerUser = requireUser(values);
  requireAuth(callerUser);
  const bind = requireBind(callerUser);

  // TODO: 调用 API 获取屏幕快照
  output({ ok: true, message: "TODO: screenshot", screenId: bind.screenId });
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
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
    case "login":        return handleLogin(rest);
    case "verify":       return handleVerify(rest);
    case "check":        return handleCheck(rest);
    case "me":           return handleMe(rest);
    case "logout":       return handleLogout(rest);
    case "list-screen":  return handleListScreen(rest);
    case "bind-screen":  return handleBindScreen(rest);
    case "play-image":   return handlePlayImage(rest);
    case "play-html":    return handlePlayHtml(rest);
    case "screenshot":   return handleScreenshot(rest);
    default:             outputError(`未知命令: ${command}`, "支持: login, verify, check, me, logout, list-screen, bind-screen, play-image, play-html, screenshot");
  }
}

main().catch((error) => {
  outputError(`内部错误: ${getErrorMessage(error)}`);
});
