#!/usr/bin/env bash
# Regenerate blogs/posts.json from the .md files in blogs/.
# Usage: tools/index-posts.sh
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root/blogs"

{
  echo "["
  first=1
  for f in *.md; do
    [ -e "$f" ] || continue
    if [ $first -eq 0 ]; then echo ","; fi
    printf '  "%s"' "$f"
    first=0
  done
  echo
  echo "]"
} > posts.json

echo "wrote blogs/posts.json:"
cat posts.json
