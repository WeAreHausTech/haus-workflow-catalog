#!/usr/bin/env bash
# Non-interactive catalog release (release-it --ci).
#
# Usage: ./scripts/release.sh <version>
# Example: ./scripts/release.sh 2.1.1
#
# Interactive: yarn release
# Dry run:     yarn release:dry

set -euo pipefail

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Usage: $0 <version>"
  echo ""
  echo "Interactive: yarn release"
  echo "Dry run:     yarn release:dry"
  exit 1
fi

if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: version must be x.y.z (got '$VERSION')"
  exit 1
fi

yarn release "$VERSION" --ci
