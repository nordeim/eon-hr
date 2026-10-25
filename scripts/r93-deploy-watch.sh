#!/bin/bash
# r93 deploy-watch — the opening read: login-page asset fingerprints, both sides.
REF=$(curl -s https://eon.base44.app/login)
LOC=$(curl -s http://127.0.0.1:3200/login)
echo "=== REF login assets ==="
echo "$REF" | grep -oE '/_next/static/[^"]+\.(js|css)' | sort -u
echo "=== LOC login assets ==="
echo "$LOC" | grep -oE '/_next/static/[^"]+\.(js|css)' | sort -u
echo "=== REF turnstile ==="
echo "$REF" | grep -oE 'challenges\.cloudflare\.com[^"]*' | sort -u | head -3
echo "REF title: $(echo "$REF" | grep -oE '<title>[^<]*</title>')"
