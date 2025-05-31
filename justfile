# Launch Chrome with the extension loaded for development

# Set the extension directory and Chrome path
EXT_DIR := "{{justfile_directory()}}/src"
CHROME_PATH := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

launch-chrome-extension:
    just zip-src
    if [ ! -d "{{justfile_directory()}}/src" ]; then \
      echo "Extension directory not found: {{justfile_directory()}}/src"; \
      exit 1; \
    fi
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --disable-extensions-except="{{justfile_directory()}}/src" \
      --load-extension="{{justfile_directory()}}/src" \
      --user-data-dir="/tmp/chrome-ext-dev-profile" \
      "https://startlist.club/Account/Login" &
    echo "Chrome launched with extension loaded from {{justfile_directory()}}/src and opened https://startlist.club/Account/Login."

zip-src:
    rm -f {{justfile_directory()}}/src.zip
    cd {{justfile_directory()}}/src && zip -r ../src.zip .
    echo "src directory zipped to src.zip."
