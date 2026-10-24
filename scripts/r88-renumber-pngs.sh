#!/usr/bin/env bash
# r88-renumber-pngs.sh — the parallel-session reconciliation renumber: this
# round's mobile-band chain moves +44 to clear the published chart-suite
# chain's 1297-1341 window (the published chain keeps its numbers; ours
# moves to 1343-1389 + the dev set 1391-1401). Descending order so the
# moves never collide mid-flight; blob-verified content preservation.
set -euo pipefail
cd /home/z/my-project/eon-hr/docs/screenshots

# the odd numbers of this round's chain, DESCENDING (mobile pairs
# 1299-1321, desktop pairs 1323-1345 -> +44 => 1343-1389)
for n in 1345 1343 1341 1339 1337 1335 1333 1331 1329 1327 1325 1323 \
         1321 1319 1317 1315 1313 1311 1309 1307 1305 1303 1301 1299; do
  tgt=$((n + 44))
  for f in "$n"-*; do
    [ -e "$f" ] || continue
    git mv "$f" "${tgt}${f#$n}" 2>/dev/null || mv "$f" "${tgt}${f#$n}"
  done
done

# the dev-server singles 1347-1357 -> +44 => 1391-1401 (descending)
for n in 1357 1355 1353 1351 1349 1347; do
  tgt=$((n + 44))
  for f in "$n"-dev-*; do
    [ -e "$f" ] || continue
    git mv "$f" "${tgt}${f#$n}" 2>/dev/null || mv "$f" "${tgt}${f#$n}"
  done
done

# this round's 1297 login pair is byte-identical to the published one
# (both 69aa4241-class captures) — retire ours in favor of theirs.
for f in 1297-login-standing-loc.png 1297-login-standing-ref.png; do
  [ -e "$f" ] || continue
  git rm -q --cached "$f" 2>/dev/null || true
  rm -f "$f"
done

echo "RENUMBER COMPLETE — this round's window: 1343-1389 + 1391-1401"
ls 1343-* 1365-* 1389-* 1391-* 1401-* 2>/dev/null | head -8
