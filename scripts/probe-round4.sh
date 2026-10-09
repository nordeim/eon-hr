#!/usr/bin/env bash
# Dual-browser DOM probe — usage: probe.sh <session> <js-file>
S="$1"; shift
J="$1"; shift
agent-browser eval "$(cat "$J")" --session "$S" "$@"
