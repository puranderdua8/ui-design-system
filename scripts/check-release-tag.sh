#!/usr/bin/env bash
# Fails unless the release tag (v<version>) equals the version in a package.json.
# Usage: scripts/check-release-tag.sh <tag> <path/to/package.json>
set -euo pipefail

TAG="${1:?usage: check-release-tag.sh <tag> <package.json>}"
PKG="${2:?usage: check-release-tag.sh <tag> <package.json>}"

VERSION="$(node -p "require('./$PKG').version")"

if [ "$TAG" != "v$VERSION" ]; then
  echo "::error::Tag $TAG does not match $PKG version $VERSION (expected v$VERSION). Nothing was published."
  exit 1
fi

echo "Tag $TAG matches $PKG version $VERSION."
