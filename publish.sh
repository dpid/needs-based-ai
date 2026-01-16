#!/bin/bash
# Convenience script for publishing after worktree migration
# Pulls latest changes, builds, and provides publish command

set -e

cd master
git pull
npm run build

echo ""
echo "Build complete. Ready to publish."
echo "Run: cd master && npm publish --access public"
