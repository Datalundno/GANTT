#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 /path/to/Website"
  exit 1
fi
mkdir -p "$TARGET/public/downloads" "$TARGET/public/visuals/gantt" "$TARGET/demo"
cp "$ROOT/public/downloads/ganttChart.pbiviz" "$TARGET/public/downloads/"
cp "$ROOT/public/downloads/GanttSampleData.xlsx" "$TARGET/public/downloads/"
cp "$ROOT/public/visuals/gantt/index.html" "$TARGET/public/visuals/gantt/index.html"
cp "$ROOT/index.html" "$TARGET/index.html"
cp "$ROOT/demo-index.html" "$TARGET/demo/index.html"
echo "Copied 1.7 files into $TARGET — commit and push."
