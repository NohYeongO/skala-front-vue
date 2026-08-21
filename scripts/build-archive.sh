#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_PATH="${VITE_BASE_PATH:-/skala-front-vue/}"
WORK_DIR="$ROOT/.archive-build"
OUT_DIR="$ROOT/dist/archive"

ARCHIVES=(
  "01-mockup:weather-mockup"
  "02-composition:weather-composition"
  "03-component:weather-component"
  "04-router:weather-router"
  "05-store:weather-store"
  "06-axios:weather-axios"
  "07-ui-library:weather-ui-library"
)

mkdir -p "$OUT_DIR" "$WORK_DIR"
git -C "$ROOT" fetch --quiet origin || true

for entry in "${ARCHIVES[@]}"; do
  name="${entry%%:*}"
  branch="${entry##*:}"
  target="$WORK_DIR/$name"
  echo "▶ building $name from $branch"
  rm -rf "$target"
  git -C "$ROOT" worktree prune
  if git -C "$ROOT" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$ROOT" worktree add --quiet --detach "$target" "$branch"
  else
    git -C "$ROOT" worktree add --quiet --detach "$target" "origin/$branch"
  fi
  (
    cd "$target"
    npm ci --no-audit --no-fund --silent
    npx vite build --base="${BASE_PATH}archive/$name/" --outDir "$OUT_DIR/$name" --emptyOutDir --logLevel error
  )
  git -C "$ROOT" worktree remove --force "$target"
done

echo "✔ archives built into $OUT_DIR"
