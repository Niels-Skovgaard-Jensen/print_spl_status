#!/bin/bash

# Ensure we exit on any error
set -e

# Get version from manifest.json
VERSION=$(cat src/manifest.json | grep '"version"' | cut -d'"' -f4)

# Create zip file name with version
ZIP_FILE="training-status-printer-v$VERSION.zip"

# Remove old zip if it exists
rm -f "$ZIP_FILE"

# Create zip file from src directory
cd src && zip -r "../$ZIP_FILE" . -x ".*" -x "__MACOSX*" && cd ..

echo "Created release package: $ZIP_FILE"
echo "Version: $VERSION"

# Create git tag and push
if [ "$1" = "--release" ]; then
    # Create and push the tag
    git tag -a "v$VERSION" -m "Version $VERSION"
    git push origin "v$VERSION"
    
    echo "Created and pushed tag: v$VERSION"
    echo "GitHub Actions will now:"
    echo "1. Create a GitHub release"
    echo "2. Upload the extension to the Chrome Web Store"
    echo ""
    echo "Check the Actions tab on GitHub to monitor progress"
fi
