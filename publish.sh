#!/usr/bin/env bash
# One-shot publish helper for dsh-voice-enhance.
#
# Does the parts that need this machine: rewrite the placeholders to your
# GitHub user, commit, and push the repository. The catalog PR is left to
# you — it happens on someone else's repository and needs your account.
#
#   bash publish.sh <github-username>
#
set -euo pipefail

USER="${1:-}"
if [ -z "$USER" ]; then
  echo "usage: bash publish.sh <github-username>" >&2
  exit 2
fi

cd "$(dirname "$0")"

if ! grep -q 'YOUR-NAME' package.json; then
  echo "!  placeholders already replaced — nothing to rewrite"
else
  sed -i "s/YOUR-NAME/$USER/g" package.json catalog/data-plugins.yml
  echo ">  rewrote placeholders to '$USER'"
fi

git add -A
git -c user.name="$USER" -c user.email="$USER@users.noreply.github.com" \
  commit -m "chore: point repository metadata at github.com/$USER" >/dev/null || true

if git remote get-url origin >/dev/null 2>&1; then
  echo ">  origin already set: $(git remote get-url origin)"
else
  git remote add origin "https://github.com/$USER/dsh-voice-enhance.git"
  echo ">  origin -> https://github.com/$USER/dsh-voice-enhance.git"
fi

echo
echo "Next: create the EMPTY (no README/licence/gitignore) repo"
echo "  https://github.com/new  —  name: dsh-voice-enhance  —  public"
echo "Then push:"
echo "  git push -u origin main"
echo
echo "Finally: add the 'dsh-plugin' topic to the repo, and open the catalog PR"
echo "using the file in catalog/data-plugins.yml (see catalog/PR-INSTRUCTIONS.md)."
