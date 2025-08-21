#!/bin/bash
set -euo pipefail

PORT=${PORT:-5551}

# Genres index → random pick from its list
# 0: rock / blues
tracks_0=(
  "https://music.youtube.com/watch?v=G_HPZoqEhoI&si=loIjZxJFWxNYna_d"  # The Heavy – Short Change Hero → blues‑rock/soul, cinematic, dark swagger
  "https://music.youtube.com/watch?v=Q5Sq-8_1C3g&si=HRFVMW25RnKt-2eo"
  "https://music.youtube.com/watch?v=LzEhfnnSVDE&si=iZVWEGMMBfLDnVM5"
  "https://music.youtube.com/watch?v=ZUtAe5PUKtE&si=V5zJWrGotF_tAzgr"
  "https://music.youtube.com/watch?v=SWC_1gH2fx4&si=wS7nF0Z3KN3cjzcG"
)
# 1: hip‑hop / boom‑bap
tracks_1=(
  "https://music.youtube.com/watch?v=f17KRK0CYRY&si=-kFz0JUSvvLP944V"  # The Notorious B.I.G – My Downfall (Mono Cdm remix) → classic East Coast, gritty boombap
)
# 2: pop‑rap / R&B
tracks_2=(
  "https://music.youtube.com/watch?v=CPETPGPVW8s&si=J6CetLLimnxab2eZ"  # Doja Cat – Juicy (feat. Tyga) → pop‑rap/R&B, upbeat & playful
  "https://music.youtube.com/watch?v=gEnityjo1Lk&si=8hqkfLxrMKAZZ8zC"
)
# 3: electro/retro swing
tracks_3=(
  "https://music.youtube.com/watch?v=ZJoOcn6nDMY&si=jwLiZszmBT5idjYz"  # Caro Emerald – Back It Up (feat. Madcon) → retro/electro swing, groovy
)

GENRES=4

index=${1:-}
if [[ -z "$index" || ! "$index" =~ ^[0-9]+$ || $index -lt 0 || $index -ge $GENRES ]]; then
  echo "Usage: $0 [0-$((GENRES-1))]"
  echo "  0: rock/blues, 1: hiphop, 2: pop-rap, 3: swing"
  exit 1
fi

# Pick random URL from selected genre row
declare -n ROW="tracks_${index}"
if ((${#ROW[@]}==0)); then
  echo "No tracks configured for genre $index"
  exit 1
fi
rand=$(( RANDOM % ${#ROW[@]} ))
url="${ROW[$rand]}"

curl -s -X POST "http://localhost:$PORT/command" \
  -H "Content-Type: application/json" \
  -d "{\"command\":\"load-radio\",\"args\":{\"url\":\"$url\"}}"
