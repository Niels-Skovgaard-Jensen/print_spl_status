```bash
# Launch Chrome with the extension loaded for development
EXT_DIR="$(cd "$(dirname "$0")" && pwd)/src"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -d "$EXT_DIR" ]; then
  echo "Extension directory not found: $EXT_DIR"
  exit 1
fi

# Open Chrome with the extension loaded (adjust user-data-dir to avoid profile conflicts)
"$CHROME_PATH" \
  --disable-extensions-except="$EXT_DIR" \
  --load-extension="$EXT_DIR" \
  --user-data-dir="/tmp/chrome-ext-dev-profile" &

echo "Chrome launched with extension loaded from $EXT_DIR."
```