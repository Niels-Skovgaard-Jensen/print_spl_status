# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Chrome extension that formats SPL (training) status pages from startlist.club for either A4 printing or mobile editing. The extension provides a popup interface to select training modules and formatting options, then generates either a print-optimized view or a mobile-friendly HTML document with editable text areas.

## Architecture
- **popup.js**: Main popup interface that extracts training module data from the active tab and handles user interaction
- **content.js**: Content script that formats the training page for either printing (A4 layout) or mobile editing (downloadable HTML with localStorage persistence)
- **manifest.json**: Chrome extension configuration (Manifest V3)

## Key Functionality
The extension follows a popup → content script communication pattern:
1. Popup extracts module data using `getTrainingModules()` function injected into active tab
2. User selects modules, formatting options, and output format (print vs mobile) in popup
3. Popup sends options via `chrome.tabs.sendMessage()` to content script
4. Content script generates either:
   - **Print format**: Formatted HTML that opens in new window for printing
   - **Mobile format**: Downloadable HTML file with editable text areas and localStorage persistence

## Mobile Format Features (v1.2+)
- **Phone-optimized responsive design** with touch-friendly interface
- **Editable text areas** for adding notes to incomplete training items
- **Auto-save functionality** using localStorage with 1-second delay
- **Export/Import capabilities** for backing up notes as JSON files
- **Offline functionality** - generated HTML works without internet connection
- **Persistent storage** - notes survive browser restarts on the same device

## Development Commands
- Launch extension in Chrome: `just launch-chrome-extension`
- Create development zip: `just zip-src`
- Development mode: `./dev.sh` (launches Chrome with extension loaded)
- Create release: `./release.sh` (creates versioned zip)
- Create release with git tag: `./release.sh --release`

## Important Implementation Details
- Extension targets startlist.club's training status pages
- Extracts data from table structure with `.container.body-content` selector
- Module identification uses format "G1-", "G2-" etc. extracted from bold text
- **Print formatting** includes A4 page sizing, status indicators, and optional notepad areas
- **Mobile formatting** generates standalone HTML with embedded CSS/JS, localStorage persistence, and responsive design
- Uses window management to prevent multiple print windows (`window._splPrintWindow`)
- Mobile documents use unique document IDs for localStorage namespacing (`spl_training_{pilot}_{timestamp}`)