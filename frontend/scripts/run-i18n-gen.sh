#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
key=$(grep -E '^ANTHROPIC_API_KEY=' ../backend/.env | head -1 | sed -E 's/^ANTHROPIC_API_KEY=//; s/\r$//; s/^"//; s/"$//; s/^'\''//; s/'\''$//')
export ANTHROPIC_API_KEY="$key"
node scripts/generate-translations.mjs
