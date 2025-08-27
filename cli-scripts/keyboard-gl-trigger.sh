#!/usr/bin/env bash
# Usage: ./keyboard-gl-trigger.sh <localName>

set -euo pipefail

# --- Hardcoded config ---
HOST="raspberrypi.lan"
PORT="18080"
SCOPE="virtual"              # platform/streams/triggers/<scope>
ORIGIN_ID="pc.fakelaptop"    # emitter origin
CLASS="keyboard.Shortcut"
ACTION="click"
# -------------------------

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <localName>"
  exit 1
fi

LOCAL_NAME="$1"
TRIGGER_ID="${ORIGIN_ID}.${LOCAL_NAME}"
URL="http://${HOST}:${PORT}/triggers/${SCOPE}/${TRIGGER_ID}"

# current timestamp in ISO UTC (ms precision)
FIRED_AT=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

# fire and forget
curl -i -X POST "${URL}" \
  -H 'Content-Type: application/json' \
  -d "{
    \"originId\": \"${ORIGIN_ID}\",
    \"localName\": \"${LOCAL_NAME}\",
    \"class\": \"${CLASS}\",
    \"action\": \"${ACTION}\",
    \"firedAt\": \"${FIRED_AT}\"
  }"
