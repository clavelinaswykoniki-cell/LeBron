#!/usr/bin/env bash
# test-api.sh — 一键回归测试所有 REST 路由
#
# 用法：
#   cd server
#   ./test-api.sh                 # 完整跑（不烧 DeepSeek token，只测路由结构）
#   ./test-api.sh --include-llm   # 跑真实 DeepSeek 联调（会消耗 token / 钱）
#
# 前置：本地后端在跑 (npm start) 或脚本会自动起一个临时实例

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
INCLUDE_LLM=0
for arg in "$@"; do
  case "$arg" in
    --include-llm) INCLUDE_LLM=1 ;;
  esac
done

echo "🎯 BASE_URL = $BASE_URL"
echo ""

# 探测后端是否已经在跑
SERVER_STARTED=0
if ! curl -sf "$BASE_URL/health" > /dev/null 2>&1; then
  echo "💡 后端没在跑，临时启动..."
  node server.js > /tmp/lebron-server.log 2>&1 &
  SERVER_PID=$!
  SERVER_STARTED=1
  trap "kill $SERVER_PID 2>/dev/null || true" EXIT
  for i in 1 2 3 4 5; do
    if curl -sf "$BASE_URL/health" > /dev/null 2>&1; then
      echo "   ready after ${i}s"
      break
    fi
    sleep 1
  done
fi

# 通过 python3 美化 JSON 输出（兜底：直接 cat）
pj() {
  if command -v python3 > /dev/null 2>&1; then
    python3 -m json.tool 2>/dev/null || cat
  else
    cat
  fi
}

PASS=0
FAIL=0
check_status() {
  local got="$1" want="$2" label="$3"
  if [ "$got" = "$want" ]; then
    echo "   ✅ $label HTTP $got"
    PASS=$((PASS + 1))
  else
    echo "   ❌ $label expected HTTP $want, got $got"
    FAIL=$((FAIL + 1))
  fi
}

echo "===== 1. /health ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" "$BASE_URL/health")
check_status "$status" 200 "/health"
cat /tmp/_resp.json | pj

echo ""
echo "===== 2. GET /api/leaderboard ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" "$BASE_URL/api/leaderboard?limit=10")
check_status "$status" 200 "/api/leaderboard"
cat /tmp/_resp.json | pj

echo ""
echo "===== 3. POST /api/pk/submit 正常 ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" -X POST "$BASE_URL/api/pk/submit" \
  -H "Content-Type: application/json" \
  -d '{"openid":"local_smoke_run","nickname":"smoke测","score":60,"total":5,"delta":10}')
check_status "$status" 200 "/api/pk/submit"
cat /tmp/_resp.json | pj

echo ""
echo "===== 4. POST /api/pk/submit 校验 (缺 openid) ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" -X POST "$BASE_URL/api/pk/submit" \
  -H "Content-Type: application/json" \
  -d '{"score":50,"total":5}')
check_status "$status" 400 "/api/pk/submit invalid"

echo ""
echo "===== 5. POST /api/daily/checkin 正常 ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" -X POST "$BASE_URL/api/daily/checkin" \
  -H "Content-Type: application/json" \
  -d '{"openid":"local_smoke_run","card_id":"card_001"}')
check_status "$status" 200 "/api/daily/checkin first"
cat /tmp/_resp.json | pj

echo ""
echo "===== 6. POST /api/daily/checkin 重复 (already_checked_in) ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" -X POST "$BASE_URL/api/daily/checkin" \
  -H "Content-Type: application/json" \
  -d '{"openid":"local_smoke_run"}')
check_status "$status" 200 "/api/daily/checkin repeat"
cat /tmp/_resp.json | pj

echo ""
echo "===== 7. GET /api/llm/health ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" "$BASE_URL/api/llm/health")
check_status "$status" 200 "/api/llm/health"
cat /tmp/_resp.json | pj

echo ""
echo "===== 8. POST /api/llm/enhance 校验 (缺 userQuery) ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" -X POST "$BASE_URL/api/llm/enhance" \
  -H "Content-Type: application/json" -d '{}')
check_status "$status" 400 "/api/llm/enhance invalid"

echo ""
echo "===== 9. GET /api/nonexistent (404) ====="
status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" "$BASE_URL/api/nonexistent")
check_status "$status" 404 "/api/nonexistent"

if [ $INCLUDE_LLM -eq 1 ]; then
  echo ""
  echo "===== 10. POST /api/llm/enhance 真实调用（消耗 DeepSeek token）====="
  status=$(curl -s -o /tmp/_resp.json -w "%{http_code}" -X POST "$BASE_URL/api/llm/enhance" \
    -H "Content-Type: application/json" \
    -d '{"userQuery":"詹姆斯就是数据刷子","matchedCard":{"id":"test","claim":"Excel球王","short_reply":"Excel能刷20年顶级季后赛产出？"}}')
  check_status "$status" 200 "/api/llm/enhance real"
  cat /tmp/_resp.json | pj
fi

echo ""
echo "================================================"
echo "  汇总：$PASS 通过 / $FAIL 失败"
echo "================================================"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
