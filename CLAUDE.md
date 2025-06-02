# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Chrome extension that formats SPL (training) status pages from startlist.club for A4 printing. The extension provides a popup interface to select training modules and formatting options, then generates a print-optimized view.

## Architecture
- **popup.js**: Main popup interface that extracts training module data from the active tab and handles user interaction
- **content.js**: Content script that formats the training page for printing, generating styled HTML with A4 layout
- **manifest.json**: Chrome extension configuration (Manifest V3)

## Key Functionality
The extension follows a popup → content script communication pattern:
1. Popup extracts module data using `getTrainingModules()` function injected into active tab
2. User selects modules and formatting options in popup
3. Popup sends options via `chrome.tabs.sendMessage()` to content script
4. Content script generates formatted HTML and opens print window

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
- Print formatting includes A4 page sizing, status indicators, and optional notepad areas
- Uses window management to prevent multiple print windows (`window._splPrintWindow`)