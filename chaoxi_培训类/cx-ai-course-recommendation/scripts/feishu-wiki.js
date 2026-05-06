#!/usr/bin/env node

/**
 * 飞书Wiki检索工具 v2.1
 * - 所有数据从飞书API动态查询，无硬编码节点
 * - 本地缓存机制：sync 检查版本，不变走缓存，变了重新拉取
 *
 * 用法：
 *   node feishu-wiki.js sync <node_token> [depth]   同步缓存（检查版本）
 *   node feishu-wiki.js cache-status                 查看缓存状态
 *   node feishu-wiki.js --cached tree                使用缓存
 *   node feishu-wiki.js --cached find <关键词>        缓存中搜索
 *   node feishu-wiki.js tree <node_token> [depth]    在线查询
 *   node feishu-wiki.js read-doc <obj_token>         读取文档
 */

const fs = require('fs');
const path = require('path');

// ===== 配置 =====
const APP_ID = 'cli_a954fd9249b85bef';
const APP_SECRET = 'rn5ELZwM0WwEFS8Ni7kdLgwEKrndCTQZ';
const BASE_URL = 'https://open.feishu.cn/open-apis';
const CACHE_DIR = path.join(__dirname, '.wiki-cache');
const CACHE_META = path.join(CACHE_DIR, 'meta.json');

// ===== Token 管理 =====
let _token = null;
let _tokenExpire = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExpire) return _token;
  const res = await fetch(`${BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`获取token失败: ${data.msg}`);
  _token = data.tenant_access_token;
  _tokenExpire = Date.now() + (data.expire - 300) * 1000;
  return _token;
}

// ===== 通用API调用 =====
async function api(method, path, { params, body } = {}) {
  const token = await getToken();
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  };
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url.toString(), opts);
  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`API错误 [${method} ${path}]: code=${data.code}, msg=${data.msg}`);
  }
  return data;
}

// ===== 缓存管理 =====
// 缓存结构: .wiki-cache/meta.json + .wiki-cache/docs/<obj_token>.md

function loadCache() {
  try {
    if (fs.existsSync(CACHE_META)) {
      const meta = JSON.parse(fs.readFileSync(CACHE_META, 'utf-8'));
      return meta;
    }
  } catch { /* ignore */ }
  return null;
}

function saveCache(meta) {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const docsDir = path.join(CACHE_DIR, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(CACHE_META, JSON.stringify(meta, null, 2), 'utf-8');
}

function saveDoc(objToken, content) {
  const docsDir = path.join(CACHE_DIR, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, `${objToken}.md`), content, 'utf-8');
}

function loadDoc(objToken) {
  const filePath = path.join(CACHE_DIR, 'docs', `${objToken}.md`);
  try {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf-8');
  } catch { /* ignore */ }
  return null;
}

function loadAllDocs() {
  const docsDir = path.join(CACHE_DIR, 'docs');
  const docs = {};
  try {
    if (fs.existsSync(docsDir)) {
      for (const f of fs.readdirSync(docsDir)) {
        if (f.endsWith('.md')) {
          const objToken = f.replace('.md', '');
          docs[objToken] = fs.readFileSync(path.join(docsDir, f), 'utf-8');
        }
      }
    }
  } catch { /* ignore */ }
  return docs;
}

// 从标题中提取版本号，如 "📋 总览v1.0.0" → "v1.0.0"
function extractVersion(title) {
  const match = title.match(/v\d+\.\d+(\.\d+)?/i);
  return match ? match[0] : null;
}

// ===== 知识空间 & 节点操作 =====

async function getNode(token, objType) {
  const params = { token };
  if (objType) params.obj_type = objType;
  return api('GET', '/wiki/v2/spaces/get_node', { params });
}

async function getSpaceId(nodeToken) {
  const data = await getNode(nodeToken);
  return data.data.node.space_id;
}

async function getAllNodes(spaceId, parentNodeToken) {
  const allItems = [];
  let pageToken;
  do {
    const params = { page_size: 50 };
    if (parentNodeToken) params.parent_node_token = parentNodeToken;
    if (pageToken) params.page_token = pageToken;
    const data = await api('GET', `/wiki/v2/spaces/${spaceId}/nodes`, { params });
    if (data.data?.items) allItems.push(...data.data.items);
    pageToken = data.data.has_more ? data.data.page_token : undefined;
  } while (pageToken);
  return allItems;
}

async function listSpaces(pageSize = 50) {
  return api('GET', '/wiki/v2/spaces', { params: { page_size: pageSize } });
}

// ===== 文档内容 =====

async function getDocxRawContent(objToken) {
  // 优先使用 blocks API（返回 markdown 格式）
  try {
    return await getDocxBlocksContent(objToken);
  } catch {
    // fallback 到 raw_content（纯文本）
    const data = await api('GET', `/docx/v1/documents/${objToken}/raw_content`);
    return data.data?.content || '';
  }
}

async function getDocxBlocksContent(objToken) {
  const allBlocks = [];
  let pageToken;
  do {
    const params = { page_size: 500 };
    if (pageToken) params.page_token = pageToken;
    const data = await api('GET', `/docx/v1/documents/${objToken}/blocks`, { params });
    if (data.data?.items) allBlocks.push(...data.data.items);
    pageToken = data.data.has_more ? data.data.page_token : undefined;
  } while (pageToken);
  return blocksToText(allBlocks);
}

function extractTextFromElements(elements) {
  if (!elements) return '';
  let text = '';
  for (const el of elements) {
    if (el.text_run?.content) text += el.text_run.content;
    if (el.equation?.content) text += el.equation.content;
    if (el.mention_doc?.title) text += el.mention_doc.title;
  }
  return text;
}

function blocksToText(blocks) {
  const blockMap = new Map();
  for (const item of blocks) {
    const b = item.block || item;
    if (b.block_id) blockMap.set(b.block_id, b);
  }

  const lines = [];
  const processed = new Set();

  for (const item of blocks) {
    const b = item.block || item;
    if (!b.block_type || processed.has(b.block_id)) continue;
    processed.add(b.block_id);

    switch (b.block_type) {
      case 1: { const t = extractTextFromElements(b.page?.elements); if (t) lines.push(`# ${t}\n`); break; }
      case 2: { const t = extractTextFromElements(b.text?.elements); if (t) lines.push(t); break; }
      case 3: case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11: {
        const level = b.block_type - 2;
        const t = extractTextFromElements(b[`heading${level}`]?.elements);
        if (t) lines.push(`${'#'.repeat(Math.min(level, 6))} ${t}`);
        break;
      }
      case 12: { const t = extractTextFromElements(b.bullet?.elements); if (t) lines.push(`- ${t}`); break; }
      case 13: { const t = extractTextFromElements(b.ordered?.elements); if (t) lines.push(`1. ${t}`); break; }
      case 14: { const t = extractTextFromElements(b.code?.elements); if (t) lines.push(`\`\`\`\n${t}\n\`\`\``); break; }
      case 15: { const t = extractTextFromElements(b.quote?.elements); if (t) lines.push(`> ${t}`); break; }
      case 16: { const t = extractTextFromElements(b.todo?.elements); if (t) lines.push(`- [ ] ${t}`); break; }
      case 22: { lines.push('---'); break; }
      case 23: {
        // 表格：从 blockMap 中查找子 cell 并渲染为 markdown 表格
        const tableRows = b.table?.property?.table_size?.rows || 0;
        const tableCols = b.table?.property?.table_size?.columns || 0;
        if (tableRows > 0 && tableCols > 0) {
          const cells = [];
          for (const [cid, cb] of blockMap) {
            if (cb.block_type === 24 && cb.parent_id === b.block_id) {
              processed.add(cid);
              const row = cb.table_cell?.property?.row_index ?? 0;
              const col = cb.table_cell?.property?.column_index ?? 0;
              if (!cells[row]) cells[row] = [];
              cells[row][col] = extractTextFromElements(cb.table_cell?.elements) || '';
            }
          }
          for (let r = 0; r < Math.min(cells.length, tableRows); r++) {
            const row = cells[r] || [];
            const cols = [];
            for (let c = 0; c < tableCols; c++) cols.push(row[c] || '');
            lines.push(`| ${cols.join(' | ')} |`);
            if (r === 0) lines.push(`| ${cols.map(() => '---').join(' | ')} |`);
          }
          lines.push('');
        }
        break;
      }
      default: break;
    }
  }
  return lines.join('\n');
}

// ===== 树形结构 =====

async function getTree(spaceId, parentNodeToken, maxDepth = 2, currentDepth = 0) {
  const nodes = await getAllNodes(spaceId, parentNodeToken);
  const tree = [];
  for (const node of nodes) {
    const item = {
      title: node.title,
      node_token: node.node_token,
      obj_token: node.obj_token,
      obj_type: node.obj_type,
      has_child: node.has_child,
    };
    if (node.has_child && currentDepth < maxDepth - 1) {
      item.children = await getTree(spaceId, node.node_token, maxDepth, currentDepth + 1);
    }
    tree.push(item);
  }
  return tree;
}

function formatTree(tree, indent = 0) {
  let output = '';
  const prefix = '  '.repeat(indent);
  for (const node of tree) {
    const icon = node.has_child ? '\u{1f4c2}' : '\u{1f4c4}';
    output += `${prefix}${icon} ${node.title} (node: ${node.node_token})\n`;
    if (node.children) output += formatTree(node.children, indent + 1);
  }
  return output;
}

// ===== 同步缓存 =====

async function syncCache(rootNodeToken, depth = 2) {
  // 1. 获取根节点信息
  const nodeInfo = await getNode(rootNodeToken);
  const root = nodeInfo.data.node;
  const spaceId = root.space_id;
  const onlineVersion = extractVersion(root.title);

  // 2. 检查缓存
  const meta = loadCache();
  if (meta && meta.version === onlineVersion && meta.root_node_token === rootNodeToken) {
    const docCount = fs.readdirSync(path.join(CACHE_DIR, 'docs')).filter(f => f.endsWith('.md')).length;
    console.log(`缓存已是最新 (${onlineVersion})，无需更新`);
    console.log(`文档数: ${docCount} | 同步时间: ${meta.updated_at}`);
    return meta;
  }

  // 3. 版本不同或无缓存，全量拉取
  const oldVersion = meta?.version || '无';
  console.log(`版本变更: ${oldVersion} → ${onlineVersion || '未检测到版本号'}`);
  console.log('正在全量拉取知识库...');

  // 确保目录存在
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const docsDir = path.join(CACHE_DIR, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  // 清除旧文档
  for (const f of fs.readdirSync(docsDir)) {
    fs.unlinkSync(path.join(docsDir, f));
  }

  const tree = await getTree(spaceId, rootNodeToken, depth, 0);

  // 收集所有 obj_token
  const objTokens = new Set();
  objTokens.add(root.obj_token);
  function collect(items) {
    for (const item of items) {
      if (item.obj_token) objTokens.add(item.obj_token);
      if (item.children) collect(item.children);
    }
  }
  collect(tree);

  // 并行读取所有文档（并发数 5，批次间延迟 200ms）
  const objList = [...objTokens];
  const total = objList.length;
  let done = 0;
  const CONCURRENCY = 5;

  async function fetchOne(objToken) {
    try {
      const content = await getDocxRawContent(objToken);
      saveDoc(objToken, content);
    } catch (e) {
      saveDoc(objToken, `[读取失败: ${e.message}]`);
    } finally {
      done++;
      process.stderr.write(`\r读取文档 ${done}/${total}...`);
    }
  }

  for (let i = 0; i < objList.length; i += CONCURRENCY) {
    const batch = objList.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(fetchOne));
    if (i + CONCURRENCY < objList.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  process.stderr.write('\r\n');

  const newMeta = {
    version: onlineVersion || 'unknown',
    root_node_token: rootNodeToken,
    root_title: root.title,
    space_id: spaceId,
    updated_at: new Date().toISOString(),
    tree,
  };

  saveCache(newMeta);
  console.log(`同步完成！版本: ${onlineVersion || 'unknown'} | 文档数: ${objTokens.size}`);
  return newMeta;
}

// ===== 缓存查询 =====

// 在缓存的树中按标题关键词搜索
function findInCache(meta, keyword) {
  const results = [];
  function search(items) {
    for (const item of items) {
      if (item.title.includes(keyword)) results.push(item);
      if (item.children) search(item.children);
    }
  }
  search(meta.tree);
  return results;
}

// 在缓存的文档内容中搜索
function searchInCacheContent(meta, keyword) {
  const results = [];
  const docs = loadAllDocs();
  for (const [objToken, content] of Object.entries(docs)) {
    if (content.includes(keyword)) {
      let title = objToken;
      function findTitle(items) {
        for (const item of items) {
          if (item.obj_token === objToken) { title = item.title; return; }
          if (item.children) findTitle(item.children);
        }
      }
      findTitle(meta.tree);
      results.push({ title, obj_token: objToken });
    }
  }
  return results;
}

// 在线搜索（递归遍历节点树）
async function findNodesOnline(spaceId, parentNodeToken, keyword, depth = 3, currentDepth = 0) {
  const results = [];
  const nodes = await getAllNodes(spaceId, parentNodeToken);
  for (const node of nodes) {
    if (node.title.includes(keyword)) {
      results.push({
        title: node.title,
        node_token: node.node_token,
        obj_token: node.obj_token,
        has_child: node.has_child,
      });
    }
    if (node.has_child && currentDepth < depth - 1) {
      results.push(...await findNodesOnline(spaceId, node.node_token, keyword, depth, currentDepth + 1));
    }
  }
  return results;
}

// ===== CLI 入口 =====

async function main() {
  const rawArgs = process.argv.slice(2);

  // 解析 --cached 全局标志
  const useCache = rawArgs.includes('--cached');
  const args = rawArgs.filter(a => a !== '--cached');
  const command = args[0];
  const cmdArgs = args.slice(1);

  try {
    switch (command) {
      // ===== 缓存相关 =====

      case 'sync': {
        const nodeToken = cmdArgs[0];
        if (!nodeToken) { console.error('用法: sync <node_token> [depth]'); process.exit(1); }
        const depth = parseInt(cmdArgs[1]) || 3;
        await syncCache(nodeToken, depth);
        break;
      }

      case 'cache-status': {
        const meta = loadCache();
        if (!meta) {
          console.log('无本地缓存，请先运行: sync <node_token>');
        } else {
          const docDir = path.join(CACHE_DIR, 'docs');
          const docCount = fs.existsSync(docDir) ? fs.readdirSync(docDir).filter(f => f.endsWith('.md')).length : 0;
          console.log(`版本: ${meta.version}`);
          console.log(`根节点: ${meta.root_title}`);
          console.log(`文档数: ${docCount}`);
          console.log(`同步时间: ${meta.updated_at}`);
          console.log(`缓存目录: ${CACHE_DIR}`);
        }
        break;
      }

      case 'cache-clear': {
        if (fs.existsSync(CACHE_DIR)) {
          fs.rmSync(CACHE_DIR, { recursive: true });
          console.log('缓存已清除');
        } else {
          console.log('无缓存');
        }
        break;
      }

      // ===== 在线命令 =====

      case 'list-spaces': {
        const data = await listSpaces();
        const items = data.data?.items || [];
        if (!items.length) {
          console.log('应用未被加入任何知识空间');
        } else {
          for (const s of items) console.log(`- ${s.name} (space_id: ${s.space_id}, type: ${s.space_type})`);
        }
        break;
      }

      case 'get-node': {
        const token = cmdArgs[0];
        if (!token) { console.error('用法: get-node <token> [obj_type]'); process.exit(1); }
        const data = await getNode(token, cmdArgs[1]);
        const n = data.data.node;
        console.log(`标题: ${n.title}`);
        console.log(`node_token: ${n.node_token}`);
        console.log(`obj_token: ${n.obj_token}`);
        console.log(`obj_type: ${n.obj_type}`);
        console.log(`space_id: ${n.space_id}`);
        console.log(`has_child: ${n.has_child}`);
        if (n.parent_node_token) console.log(`parent: ${n.parent_node_token}`);
        break;
      }

      case 'list-nodes': {
        const nodeToken = cmdArgs[0];
        if (!nodeToken) { console.error('用法: list-nodes <node_token>'); process.exit(1); }

        if (useCache) {
          const meta = loadCache();
          if (!meta) { console.error('无缓存，请先运行 sync'); process.exit(1); }
          function findChildren(items, token) {
            for (const item of items) {
              if (item.node_token === token && item.children) return item.children;
              if (item.children) { const r = findChildren(item.children, token); if (r) return r; }
            }
            if (token === meta.root_node_token) return items;
            return null;
          }
          const children = findChildren(meta.tree, nodeToken) || [];
          console.log(`共 ${children.length} 个子节点 (缓存):\n`);
          for (const n of children) {
            const mark = n.has_child ? '+' : ' ';
            console.log(` [${mark}] ${n.title}`);
            console.log(`     node: ${n.node_token}  obj: ${n.obj_token}`);
          }
        } else {
          const spaceId = await getSpaceId(nodeToken);
          const nodes = await getAllNodes(spaceId, nodeToken);
          console.log(`共 ${nodes.length} 个子节点:\n`);
          for (const n of nodes) {
            const mark = n.has_child ? '+' : ' ';
            console.log(` [${mark}] ${n.title}`);
            console.log(`     node: ${n.node_token}  obj: ${n.obj_token}  type: ${n.obj_type}`);
          }
        }
        break;
      }

      case 'tree': {
        const nodeToken = cmdArgs[0];

        if (useCache) {
          const meta = loadCache();
          if (!meta) { console.error('无缓存，请先运行 sync'); process.exit(1); }
          if (nodeToken && nodeToken !== meta.root_node_token) {
            function findSubtree(items, token) {
              for (const item of items) {
                if (item.node_token === token) return [item];
                if (item.children) { const r = findSubtree(item.children, token); if (r) return r; }
              }
              return null;
            }
            const sub = findSubtree(meta.tree, nodeToken);
            console.log(sub ? formatTree(sub) : `缓存中未找到节点: ${nodeToken}`);
          } else {
            console.log(formatTree(meta.tree));
          }
        } else {
          if (!nodeToken) { console.error('用法: tree <node_token> [depth]'); process.exit(1); }
          const depth = parseInt(cmdArgs[1]) || 2;
          const spaceId = await getSpaceId(nodeToken);
          const tree = await getTree(spaceId, nodeToken, depth);
          console.log(formatTree(tree));
        }
        break;
      }

      case 'read-doc': {
        const objToken = cmdArgs[0];
        if (!objToken) { console.error('用法: read-doc <obj_token>'); process.exit(1); }

        if (useCache) {
          const meta = loadCache();
          if (!meta) { console.error('无缓存，请先运行 sync'); process.exit(1); }
          const content = loadDoc(objToken);
          if (!content) { console.error(`缓存中未找到文档: ${objToken}`); process.exit(1); }
          console.log(content);
        } else {
          console.log(await getDocxRawContent(objToken));
        }
        break;
      }

      case 'find': {
        if (useCache) {
          // 缓存模式：同时搜标题和内容
          const keyword = cmdArgs.join(' ');
          if (!keyword) { console.error('用法: --cached find <关键词>'); process.exit(1); }
          const meta = loadCache();
          if (!meta) { console.error('无缓存，请先运行 sync'); process.exit(1); }

          const titleResults = findInCache(meta, keyword);
          const contentResults = searchInCacheContent(meta, keyword);

          console.log(`搜索 "${keyword}" 结果:\n`);
          if (titleResults.length) {
            console.log(`标题匹配 (${titleResults.length}):`);
            for (const r of titleResults) console.log(`  - ${r.title} (obj: ${r.obj_token})`);
          }
          if (contentResults.length) {
            console.log(`\n内容匹配 (${contentResults.length}):`);
            for (const r of contentResults) console.log(`  - ${r.title} (obj: ${r.obj_token})`);
          }
          if (!titleResults.length && !contentResults.length) console.log('未找到匹配');
        } else {
          const nodeToken = cmdArgs[0];
          const keyword = cmdArgs.slice(1).join(' ');
          if (!nodeToken || !keyword) { console.error('用法: find <node_token> <关键词>'); process.exit(1); }
          const spaceId = await getSpaceId(nodeToken);
          const results = await findNodesOnline(spaceId, nodeToken, keyword);
          if (!results.length) {
            console.log(`未找到包含"${keyword}"的节点`);
          } else {
            console.log(`找到 ${results.length} 个匹配:\n`);
            for (const r of results) console.log(`- ${r.title}\n  node: ${r.node_token}  obj: ${r.obj_token}`);
          }
        }
        break;
      }

      case 'search': {
        // 飞书搜索API（需要 user_access_token，当前不可用）
        console.error('搜索API需要 user_access_token，当前无法使用');
        console.error('替代: --cached find <关键词> 按标题查找，或 sync 后用 read-doc 读取内容');
        process.exit(1);
      }

      case 'dump': {
        const nodeToken = cmdArgs[0];
        if (!nodeToken) { console.error('用法: dump <node_token> [depth]'); process.exit(1); }

        if (useCache) {
          const meta = loadCache();
          if (!meta) { console.error('无缓存，请先运行 sync'); process.exit(1); }
          const docs = loadAllDocs();
          console.log(JSON.stringify({ ...meta, documents: docs }, null, 2));
        } else {
          const depth = parseInt(cmdArgs[1]) || 2;
          const nodeInfo = await getNode(nodeToken);
          const spaceId = nodeInfo.data.node.space_id;
          const tree = await getTree(spaceId, nodeToken, depth);
          const objTokens = new Set();
          function collect(items) { for (const i of items) { if (i.obj_token) objTokens.add(i.obj_token); if (i.children) collect(i.children); } }
          collect(tree);
          const documents = {};
          let i = 0;
          for (const ot of objTokens) {
            i++;
            process.stderr.write(`\r${i}/${objTokens.size}...`);
            try { documents[ot] = await getDocxRawContent(ot); } catch (e) { documents[ot] = `[失败: ${e.message}]`; }
          }
          process.stderr.write('\r\n');
          console.log(JSON.stringify({ tree, documents }, null, 2));
        }
        break;
      }

      case 'help':
      default: {
        console.log(`
飞书Wiki检索工具 v2.1
======================

缓存命令:
  sync <node_token> [depth]    同步到本地（自动检查版本，变了才拉取）
  cache-status                  查看缓存状态
  cache-clear                   清除缓存

在线命令:
  get-node <token> [type]       获取节点信息
  list-nodes <node_token>       列出子节点
  tree <node_token> [depth]     树形结构
  read-doc <obj_token>          读取文档内容
  find <node_token> <关键词>    在线搜索（按标题）
  search <关键词>               飞书搜索API（需user_access_token）
  dump <node_token> [depth]     导出全部内容

缓存模式 (加 --cached 前缀，零API调用):
  --cached tree [node_token]    从缓存读树形结构
  --cached list-nodes <token>   从缓存读子节点
  --cached read-doc <obj_token> 从缓存读文档
  --cached find <关键词>        缓存全文搜索（标题+内容）
  --cached dump                 输出缓存JSON

缓存策略:
  1. 先 sync 同步一次（检查标题中的版本号如 v1.0.0）
  2. 版本相同 → 跳过拉取，走本地缓存
  3. 版本不同 → 全量重新拉取并更新缓存
  4. 后续所有操作加 --cached 即可零API调用

示例:
  node feishu-wiki.js sync Y6cVwowzViqpEFkLpEvcC0LNnEn 3
  node feishu-wiki.js --cached tree
  node feishu-wiki.js --cached find 提示词
  node feishu-wiki.js --cached read-doc DQIqdT7h5oOPDcxbFOocj17un8e
        `);
        break;
      }
    }
  } catch (e) {
    console.error(`错误: ${e.message}`);
    process.exit(1);
  }
}

// ===== 模块导出 =====
module.exports = {
  getToken, api,
  getNode, getSpaceId, getAllNodes, listSpaces,
  getDocxRawContent, blocksToText,
  getTree, formatTree,
  syncCache, loadCache, saveCache,
  findInCache, searchInCacheContent,
  CACHE_DIR, CACHE_META, BASE_URL,
};

if (require.main === module) {
  main();
}
