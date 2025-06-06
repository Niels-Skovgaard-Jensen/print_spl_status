<p align="center">
    <img src="src/icons/icon1024.png" width="256" height="256">
</p>

# SPL Training Status Formatter

A Chrome extension that formats SPL training status pages from startlist.club for A4 printing and mobile editing with note-taking capabilities.

## Features

### 🖨️ Print Format
- A4-optimized layout with proper margins and page breaks
- Color-coded status indicators for training completion
- Optional notepad areas for handwritten notes
- Module filtering to print only selected items

### 📱 Mobile Format
- Phone-optimized design with editable text areas
- Auto-save notes with localStorage persistence
- Export/Import notes as JSON files
- Works offline once downloaded

## Installation

### From Chrome Web Store (Recommended)
Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/training-status-printer/aplenabbadghkcdimaghjicncahflgac)

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome → Extensions (`chrome://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `src` folder

## Usage

1. Go to your training status page on startlist.club
2. Click the extension icon in Chrome toolbar
3. Select training modules and formatting options
4. Choose Print or Mobile format
5. Click "Format Training Status"

**Print**: Opens new window ready for printing (Ctrl+P)  
**Mobile**: Downloads HTML file to transfer to your phone/tablet

## Development

```bash
# Launch with extension loaded
just launch-chrome-extension

# Create development build
just zip-src

# Create release
./release.sh
```

## License

MIT License - see [LICENSE](LICENSE) file for details.