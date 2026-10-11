#!/usr/bin/env bash
# ensure-server.sh — guard for the :3200 LOC production server.
# The sandbox reaps background processes between tool calls; this script
# checks-and-restarts the standalone server so browser probes always have
# a target. Usage: bash scripts/ensure-server.sh
set -u
PORT=3200
URL="http://127.0.0.1:${PORT}/login"
cd "$(dirname "$0")/.."

if curl -sf -o /dev/null --max-time 3 "$URL"; then
  echo "server-already-up"
  exit 0
fi

# kill anything holding the port but refusing to serve (stale next-server)
PID="$(ss -tlnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ p {print $NF}' | grep -oP 'pid=\K[0-9]+' | head -1)"
if [ -n "${PID}" ]; then
  kill -9 "${PID}" 2>/dev/null
fi

if [ ! -f .next/standalone/server.js ]; then
  echo "FATAL: no standalone build — run bun run build first" >&2
  exit 1
fi

mkdir -p /tmp/eon-server
nohup env -u DATABASE_URL AUTH_SECRET="$(grep -oP 'AUTH_SECRET="\K[^"]+' .env)" \
  PORT=${PORT} HOSTNAME=127.0.0.1 NODE_ENV=production \
  node .next/standalone/server.js > /tmp/eon-server/server.log 2>&1 &
disown

# wait for readiness (max 30s)
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null --max-time 2 "$URL"; then
    echo "server-started"
    exit 0
  fi
  sleep 0.5
done
echo "FATAL: server did not come up" >&2
tail -5 /tmp/eon-server/server.log >&2
exit 1
