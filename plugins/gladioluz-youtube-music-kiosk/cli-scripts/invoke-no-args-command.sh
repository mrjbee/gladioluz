#!/bin/bash

# Supported commands:
#   play
#   next
#   prev
#   kiosk-start
#   kiosk-stop

PORT=5551
COMMAND=$1

if [[ -z "$COMMAND" ]]; then
  echo "Usage: $0 <command>"
  echo "Available commands: play, next, prev, kiosk-start, kiosk-stop"
  exit 1
fi

curl -s -X POST http://localhost:$PORT/command \
  -H "Content-Type: application/json" \
  -d "{\"command\":\"$COMMAND\"}"
