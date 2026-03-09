#!/bin/bash

# Fetches the latest VDL schemas from the main VDL repository.
# Files are saved preserving the same subfolder structure.

set -euo pipefail

BASE_URL="https://raw.githubusercontent.com/varavelio/vdl/refs/heads/main/schemas"
DEST_DIR="$(cd "$(dirname "$0")" && pwd)"

# List of schema paths relative to BASE_URL (and DEST_DIR)
SCHEMAS=(
  ir.vdl
  plugin.vdl
  plugin_input.vdl
  plugin_output.vdl
  common/position.vdl
)

for path in "${SCHEMAS[@]}"; do
  dest="$DEST_DIR/$path"
  mkdir -p "$(dirname "$dest")"
  echo "Fetching $path ..."
  curl -fsSL "$BASE_URL/$path" -o "$dest"
done

echo "Done"