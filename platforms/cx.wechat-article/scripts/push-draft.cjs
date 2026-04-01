'use strict';

/**
 * push-draft.cjs — 将微信 HTML 推送到公众号草稿箱
 *
 * 流程：获取 token → 上传封面 → 替换正文外部图片 → 推送草稿
 *
 * 用法：
 *   node push-draft.cjs --html <HTML文件> --title <标题> --appid <AppID> --secret <Secret> --cover <封面图>
 *
 * 依赖：Node.js 18+（内置 fetch），零 npm 依赖
 */

const fs = require('fs');
const path = require('path');

const WECHAT_API = 'https://api.weixin.qq.com/cgi-bin';
const CACHE_PATH = path.join(__dirname, '..', '.cache.json');

// ── 参数解析 ────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[++i];
    }
  }
  return args;
}

// ── 输出 ────────────────────────────────────────────────

function exitOk(data) {
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

function exitErr(error, message) {
  console.log(JSON.stringify({ ok: false, error, message }, null, 2));
  process.exit(1);
}

// ── 缓存 ────────────────────────────────────────────────

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return { covers: {}, bodyImages: {} };
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

// ── 微信 API ────────────────────────────────────────────

async function getAccessToken(appId, appSecret) {
  const url = `${WECHAT_API}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.errcode && data.errcode !== 0) {
    if (data.errcode === 40164) {
      const ip = (data.errmsg || '').match(/invalid ip\s+([\d.]+)/i);
      exitErr('40164', `IP 不在白名单。微信看到的 IP：${ip ? ip[1] : '见错误信息'}。\n请加入公众号后台 → 基本配置 → IP 白名单。\n原始错误：${data.errmsg}`);
    }
    exitErr(`token_${data.errcode}`, `获取 access_token 失败：${data.errmsg}（${data.errcode}）`);
  }

  if (!data.access_token) {
    exitErr('token_empty', `返回异常：${JSON.stringify(data)}`);
  }

  return data.access_token;
}

// ── 图片处理 ────────────────────────────────────────────

function guessMime(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  };
  return map[ext] || 'image/jpeg';
}

async function uploadCover(imageSource, token) {
  const cache = loadCache();
  if (cache.covers[imageSource]) {
    return cache.covers[imageSource];
  }

  let buffer, filename;
  const isUrl = /^https?:\/\//i.test(imageSource);

  if (isUrl) {
    const res = await fetch(imageSource);
    if (!res.ok) exitErr('cover_download_failed', `封面图下载失败（HTTP ${res.status}）：${imageSource}`);
    buffer = Buffer.from(await res.arrayBuffer());
    filename = path.basename(new URL(imageSource).pathname) || 'cover.jpg';
  } else {
    const localPath = path.isAbsolute(imageSource) ? imageSource : path.resolve(imageSource);
    if (!fs.existsSync(localPath)) exitErr('cover_not_found', `封面图文件不存在：${localPath}`);
    buffer = fs.readFileSync(localPath);
    filename = path.basename(localPath);
  }

  const mime = guessMime(filename);
  const form = new FormData();
  form.append('media', new Blob([buffer], { type: mime }), filename);

  const upRes = await fetch(`${WECHAT_API}/material/add_material?access_token=${token}&type=image`, {
    method: 'POST',
    body: form,
  });
  const upData = await upRes.json();

  if (upData.errcode && upData.errcode !== 0) {
    exitErr(`cover_${upData.errcode}`, `封面上传失败：${upData.errmsg}`);
  }

  const mediaId = upData.media_id;
  if (!mediaId) exitErr('cover_no_id', `微信返回异常：${JSON.stringify(upData)}`);

  cache.covers[imageSource] = mediaId;
  saveCache(cache);
  return mediaId;
}

async function uploadBodyImage(imageUrl, token) {
  const cache = loadCache();
  if (!cache.bodyImages) cache.bodyImages = {};
  if (cache.bodyImages[imageUrl]) return cache.bodyImages[imageUrl];

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? '.png' : contentType.includes('gif') ? '.gif' : '.jpg';

    const form = new FormData();
    form.append('media', new Blob([buffer], { type: contentType }), `body_img${ext}`);

    const upRes = await fetch(`${WECHAT_API}/media/uploadimg?access_token=${token}`, {
      method: 'POST',
      body: form,
    });
    const upData = await upRes.json();

    if (!upData.url) return null;

    cache.bodyImages[imageUrl] = upData.url;
    saveCache(cache);
    return upData.url;
  } catch {
    return null;
  }
}

async function replaceBodyImages(html, token) {
  const weixinDomains = ['mmbiz.qpic.cn', 'mmbiz.qlogo.cn', 'res.wx.qq.com'];
  const srcRegex = /src="(https?:\/\/[^"]+)"/g;
  const externalUrls = new Set();
  let m;

  while ((m = srcRegex.exec(html)) !== null) {
    if (!weixinDomains.some(d => m[1].includes(d))) {
      externalUrls.add(m[1]);
    }
  }

  if (externalUrls.size === 0) return html;

  const urlMap = {};
  for (const url of externalUrls) {
    const weixinUrl = await uploadBodyImage(url, token);
    if (weixinUrl) urlMap[url] = weixinUrl;
  }

  let result = html;
  for (const [original, replacement] of Object.entries(urlMap)) {
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), replacement);
  }

  return result;
}

// ── 推送草稿 ────────────────────────────────────────────

async function pushDraft(token, title, author, htmlContent, thumbMediaId) {
  const article = {
    title,
    content: htmlContent,
    thumb_media_id: thumbMediaId,
    show_cover_pic: 1,
    need_open_comment: 0,
  };
  if (author) article.author = author;

  const res = await fetch(`${WECHAT_API}/draft/add?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: [article] }),
  });

  const data = await res.json();

  if (data.errcode && data.errcode !== 0) {
    if (data.errcode === 40164) {
      const ip = (data.errmsg || '').match(/invalid ip\s+([\d.]+)/i);
      exitErr('40164', `IP 不在白名单。微信看到的 IP：${ip ? ip[1] : '见错误信息'}。\n请加入公众号后台 → 基本配置 → IP 白名单。`);
    }
    exitErr(`draft_${data.errcode}`, `推送草稿失败：${data.errmsg}（${data.errcode}）`);
  }

  return data.media_id;
}

// ── 主流程 ──────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // 参数校验
  if (!args.html) exitErr('missing_arg', '缺少 --html 参数（HTML 文件路径）');
  if (!args.title) exitErr('missing_arg', '缺少 --title 参数（文章标题）');
  if (!args.appid) exitErr('missing_arg', '缺少 --appid 参数（微信 AppID）');
  if (!args.secret) exitErr('missing_arg', '缺少 --secret 参数（微信 AppSecret）');
  if (!args.cover) exitErr('missing_arg', '缺少 --cover 参数（封面图 URL 或本地路径）');

  if (!fs.existsSync(args.html)) {
    exitErr('file_not_found', `HTML 文件不存在：${args.html}`);
  }

  const htmlContent = fs.readFileSync(args.html, 'utf-8');
  const author = args.author || '';

  // 获取 token
  const token = await getAccessToken(args.appid, args.secret);

  // 上传封面
  const thumbMediaId = await uploadCover(args.cover, token);

  // 替换正文外部图片
  const processedHtml = await replaceBodyImages(htmlContent, token);

  // 推送草稿
  const draftMediaId = await pushDraft(token, args.title, author, processedHtml, thumbMediaId);

  exitOk({
    ok: true,
    media_id: draftMediaId,
    title: args.title,
    message: '草稿已推送成功，请前往公众号后台 → 草稿箱查看',
  });
}

main().catch(e => exitErr('unexpected', e.message));
