#!/bin/bash

PORT=5551

# Hardcoded playlist
tracks=(
  "https://music.youtube.com/watch?v=G_HPZoqEhoI&si=loIjZxJFWxNYna_d"
  "https://music.youtube.com/watch?v=f17KRK0CYRY&si=-kFz0JUSvvLP944V"
  "https://music.youtube.com/watch?v=CPETPGPVW8s&si=J6CetLLimnxab2eZ"
  "https://music.youtube.com/watch?v=ZJoOcn6nDMY&si=jwLiZszmBT5idjYz"
)

index=$1

if [[ -z "$index" || -z "${tracks[$index]}" ]]; then
  echo "Usage: $0 [0-${#tracks[@]}]"
  exit 1
fi

url="${tracks[$index]}"

curl -s -X POST http://localhost:$PORT/command \
  -H "Content-Type: application/json" \
  -d "{\"command\":\"load-radio\",\"args\":{\"url\":\"$url\"}}"
