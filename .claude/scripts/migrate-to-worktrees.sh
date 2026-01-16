#!/bin/bash
# Convert repo to bare + worktree structure for parallel project-manager workflows

set -e

REPO_DIR=$(pwd)
REPO_NAME=$(basename "$REPO_DIR")
CURRENT_BRANCH=$(git branch --show-current)

# Safety checks
if [ ! -d ".git" ]; then
  echo "Error: Not in a git repository"
  exit 1
fi

if [ -f ".git" ]; then
  echo "Error: Already using worktree structure (.git is a file)"
  exit 1
fi

# Ensure clean working directory
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Commit or stash changes first."
  exit 1
fi

echo "Converting repo to worktree structure..."
echo "Current branch: $CURRENT_BRANCH"

# 1. Move .git to .bare
mv .git .bare

# 2. Configure bare repo
git -C .bare config core.bare false

# 3. Create gitdir pointer
echo "gitdir: ./.bare" > .git

# 4. Create master worktree directory
mkdir -p master

# 5. Move all files (except .bare, .git, master) to master/
for item in *; do
  if [[ "$item" != "master" && "$item" != ".bare" ]]; then
    mv "$item" master/
  fi
done

# Move hidden files (ignore errors for . and ..)
for item in .[!.]*; do
  if [[ "$item" != ".git" && "$item" != ".bare" ]]; then
    mv "$item" master/ 2>/dev/null || true
  fi
done

# 6. Create .git pointer in master worktree
echo "gitdir: ../.bare" > master/.git

# 7. Update .bare to point to master worktree
git -C .bare config core.worktree ../master

echo ""
echo "Migration complete!"
echo ""
echo "Your repo structure is now:"
echo "  $REPO_DIR/"
echo "  ├── .bare/        (shared git database)"
echo "  ├── .git          (pointer to .bare)"
echo "  └── master/       (main worktree)"
echo ""
echo "Next steps:"
echo "  cd master"
echo "  npm install       (reinstall dependencies)"
echo ""
echo "To create a feature worktree:"
echo "  git worktree add feature-name -b feature/feature-name"
