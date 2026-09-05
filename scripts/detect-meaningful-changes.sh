#!/usr/bin/env bash
# ==============================================================================
# DevAtlas - Meaningful Change Detector & Publisher
# Prevents meaningless/empty commits on GitHub.
# Commits strictly when reports/ or data/daily/ contain genuine modifications.
# ==============================================================================

set -euo pipefail

echo "[DevAtlas Commit Gate] Checking for meaningful changes in generated artifacts..."

# Check if there are changes in reports/ or data/daily/
if git status --porcelain reports/ data/daily/ | grep -q .; then
  echo "✓ Meaningful ecosystem intelligence or report changes detected."
  
  TODAY=$(date -u +"%Y-%m-%d")
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"

  git add reports/ data/daily/
  git commit -m "chore(data): publish daily developer intelligence for ${TODAY} [skip ci]"
  
  echo "[DevAtlas Commit Gate] Pushing committed artifacts to main branch..."
  git push origin HEAD:${GITHUB_REF_NAME:-main}
  echo "✅ Successfully published daily intelligence artifacts."
else
  echo "No meaningful changes detected in generated reports or datasets."
  echo "Skipping Git commit."
fi
