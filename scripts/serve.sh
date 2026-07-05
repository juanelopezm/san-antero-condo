#!/usr/bin/env bash
# Local preview at the same relative-path layout GitHub Pages uses.
# Usage: bash scripts/serve.sh [port]   (default 8080)
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${1:-8080}"
echo "Serving http://localhost:${PORT}/  (Spanish)  and  http://localhost:${PORT}/en/  (English)"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
