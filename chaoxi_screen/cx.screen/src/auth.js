/**
 * 认证模块 — 短信验证码登录 + 按 caller userId 存储 Token
 *
 * 存储路径:
 *   token:      [skill]/.auth/<caller_user_id>.json
 *   绑定信息:   [skill]/.auth/<caller_user_id>.bind.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";

// ─── Storage ─────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_DIR = resolve(__dirname, "..");
const AUTH_DIR = resolve(SKILL_DIR, ".auth");
const SESSION_PATH = resolve(SKILL_DIR, ".session.json");

function ensureAuthDir() {
  if (!existsSync(AUTH_DIR)) mkdirSync(AUTH_DIR, { recursive: true });
}

function authPath(callerUser) {
  return resolve(AUTH_DIR, `${callerUser}.json`);
}

function bindPath(callerUser) {
  return resolve(AUTH_DIR, `${callerUser}.bind.json`);
}

function readAuth(callerUser) {
  const path = authPath(callerUser);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function writeAuth(callerUser, data) {
  ensureAuthDir();
  writeFileSync(authPath(callerUser), JSON.stringify(data, null, 2), "utf-8");
}

function deleteAuth(callerUser) {
  const path = authPath(callerUser);
  if (existsSync(path)) unlinkSync(path);
}

function readBind(callerUser) {
  const path = bindPath(callerUser);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

export function writeBind(callerUser, data) {
  ensureAuthDir();
  writeFileSync(bindPath(callerUser), JSON.stringify(data, null, 2), "utf-8");
}

function deleteBind(callerUser) {
  const path = bindPath(callerUser);
  if (existsSync(path)) unlinkSync(path);
}

function readSession() {
  if (!existsSync(SESSION_PATH)) return null;
  try {
    return JSON.parse(readFileSync(SESSION_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function writeSession(data) {
  ensureAuthDir();
  writeFileSync(SESSION_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function clearSession() {
  if (existsSync(SESSION_PATH)) unlinkSync(SESSION_PATH);
}

// ─── Helpers ─────────────────────────────────────────

function genSessionId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "cli_";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function isValidMobile(mobile) {
  return /^1\d{10}$/.test(mobile);
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

async function apiPost(path, body) {
  const url = `${config.api.baseURL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.api.timeout),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return await res.json();
}

/** GET 请求（带 Bearer token） */
async function apiGet(path, token) {
  const url = `${config.api.baseURL}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(config.api.timeout),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return await res.json();
}

/** 上传文件（multipart/form-data，带 Bearer token） */
async function apiUpload(path, token, fieldName, filePath) {
  const { readFile } = await import("node:fs/promises");
  const { basename } = await import("node:path");

  const fileBuffer = await readFile(filePath);
  const fileName = basename(filePath);

  const formData = new FormData();
  formData.append(fieldName, new Blob([fileBuffer]), fileName);

  const url = `${config.api.baseURL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal: AbortSignal.timeout(config.api.timeout * 3),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return await res.json();
}

// ─── Public API: Auth ────────────────────────────────

/** 发送短信验证码 */
export async function login(callerUser, mobile) {
  if (!isValidMobile(mobile)) {
    return { ok: false, message: "手机号格式不正确，请输入11位手机号" };
  }

  const sessionId = genSessionId();

  try {
    const res = await apiPost("/auth/v2/send-sms-code", {
      scene: "login",
      mobile,
      sessionId,
    });

    if (res.success) {
      writeSession({ callerUser, mobile, sessionId });
      return { ok: true, message: `验证码已发送至 ${mobile.slice(0, 3)}****${mobile.slice(7)}` };
    }

    return { ok: false, message: res.message || "发送验证码失败" };
  } catch (error) {
    return { ok: false, message: `发送失败: ${getErrorMessage(error)}` };
  }
}

/** 验证短信验证码，按 callerUser 存储 token */
export async function verify(callerUser, code) {
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, message: "验证码格式不正确，请输入6位数字" };
  }

  const session = readSession();
  if (!session || session.callerUser !== callerUser) {
    return { ok: false, message: "没有待验证的登录会话，请先执行 login" };
  }

  try {
    const res = await apiPost("/auth/v2/login-via-sms", {
      scene: "login",
      mobile: session.mobile,
      sessionId: session.sessionId,
      code,
    });

    if (res.success && res.data?.jwt) {
      const auth = {
        jwt: res.data.jwt,
        userId: res.data.userId,
        mobile: session.mobile,
        role: res.data.role,
        iat: res.data.iat,
        exp: res.data.exp,
      };
      writeAuth(callerUser, auth);
      clearSession();
      return { ok: true, message: "登录成功", data: auth };
    }

    return { ok: false, message: res.message || "登录失败" };
  } catch (error) {
    return { ok: false, message: `验证失败: ${getErrorMessage(error)}` };
  }
}

/** 检查指定用户的登录状态 */
export function check(callerUser) {
  const auth = readAuth(callerUser);
  if (!auth) return { loggedIn: false, expired: false };
  return { loggedIn: true, expired: auth.exp < Math.floor(Date.now() / 1000), data: auth };
}

/** 获取指定用户信息 */
export function me(callerUser) {
  return readAuth(callerUser);
}

/** 登出指定用户 */
export function logout(callerUser) {
  const auth = readAuth(callerUser);
  if (!auth) return { ok: true, message: "该用户未登录" };
  deleteAuth(callerUser);
  deleteBind(callerUser);
  clearSession();
  return { ok: true, message: `用户 ${auth.mobile} 已登出` };
}

/** 获取指定用户的 JWT */
export function getToken(callerUser) {
  const auth = readAuth(callerUser);
  if (!auth || auth.exp < Math.floor(Date.now() / 1000)) return null;
  return auth.jwt;
}

// ─── Public API: Screen Binding ──────────────────────

/** 获取当前绑定的屏幕 */
export function getBind(callerUser) {
  return readBind(callerUser);
}

/** 清除屏幕绑定 */
export function clearBind(callerUser) {
  deleteBind(callerUser);
}

// ─── Public API: Screen Operations ───────────────────

/** 查询屏幕列表 */
export async function listScreen(callerUser) {
  const token = getToken(callerUser);
  if (!token) return { ok: false, message: "未登录或 token 已过期" };

  try {
    const res = await apiGet("/fun/screen-list", token);
    const screens = Array.isArray(res) ? res : (res?.data ?? []);
    return { ok: true, message: "查询成功", screens };
  } catch (error) {
    return { ok: false, message: `查询失败: ${getErrorMessage(error)}` };
  }
}

/** 投放图片到已绑定的屏幕 */
export async function playImage(callerUser, filePath) {
  const token = getToken(callerUser);
  if (!token) return { ok: false, message: "未登录或 token 已过期" };

  const bind = readBind(callerUser);
  if (!bind) return { ok: false, message: "未绑定屏幕" };

  try {
    const res = await apiUpload(`/fun/screen/${bind.screenId}/playImage`, token, "imgAsset", filePath);
    if (res.success) {
      return { ok: true, message: "图片投放成功" };
    }
    return { ok: false, message: res.message || "投放失败" };
  } catch (error) {
    return { ok: false, message: `投放失败: ${getErrorMessage(error)}` };
  }
}
