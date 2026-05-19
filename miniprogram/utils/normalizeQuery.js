/**
 * normalizeQuery — 把用户输入和 alias 字符串归一为可比对的形式。
 *
 * 归一规则（顺序与早期版本一致，确保向后兼容）：
 *   1. trim + 去除所有空白
 *   2. 去标点（中英常见 + 引号 + 括号 + 中括号 + 大括号）
 *   3. 同义替换（八分 → 8分；老张/老詹/勒布朗/lbj → 詹姆斯）
 *      注意：替换在 toLowerCase 之前；"LBJ"（大写）会保留为 "LBJ" → 再 toLowerCase 为 "lbj"。
 *      与早期版本完全等价。
 *   4. toLowerCase
 *
 * 性能优化点（相对早期 6 连串 .replace 实现）：
 *   - 标点合并为一条正则
 *   - 同义词合并为一条 alternation 正则 + 查表回调（早返回）
 *   - 256 项轻量 LRU 缓存：matchQuery 对 730+ 个 alias 反复调用同一字符串，命中率极高
 */

// 标点 + 各种引号/括号一次清掉
const PUNCT_RE = /[，。！？、,.!?;；:："'""''（）()【】\[\]{}]/g

// 同义词正则（顺序与早期 .replace 链一致）。注意必须在 toLowerCase 之前匹配，
// 所以 "lbj" 仅匹配已经是小写的输入；大写 "LBJ" 不会被替换，与早期行为一致。
const SYNONYM_RE = /八分|老张|老詹|勒布朗|lbj/g
const SYNONYM_MAP = {
  "八分": "8分",
  "老张": "詹姆斯",
  "老詹": "詹姆斯",
  "勒布朗": "詹姆斯",
  "lbj": "詹姆斯"
}

// 轻量 LRU 缓存（Map 保插入顺序，满了 evict 最老 key）
const CACHE_LIMIT = 256
const _cache = new Map()

function normalizeQuery(input) {
  if (!input) return ""
  const raw = typeof input === "string" ? input : String(input)
  if (!raw) return ""

  const hit = _cache.get(raw)
  if (hit !== undefined) return hit

  const out = raw
    .trim()
    .replace(/\s+/g, "")
    .replace(PUNCT_RE, "")
    .replace(SYNONYM_RE, function (m) { return SYNONYM_MAP[m] || m })
    .toLowerCase()

  if (_cache.size >= CACHE_LIMIT) {
    const firstKey = _cache.keys().next().value
    _cache.delete(firstKey)
  }
  _cache.set(raw, out)
  return out
}

module.exports = {
  normalizeQuery
}
