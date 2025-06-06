# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Chrome extension that formats SPL (training) status pages from startlist.club for either A4 printing or mobile editing. The extension provides a popup interface to select training modules and formatting options, then generates either a print-optimized view or a mobile-friendly HTML document with editable text areas.

## Architecture
The extension uses a modular architecture with separated concerns:

### Core Files
- **popup.js**: Main popup interface that extracts training module data from the active tab and handles user interaction
- **content.js**: Main coordinator script that handles message passing and routes to appropriate formatters
- **manifest.json**: Chrome extension configuration (Manifest V3) with content_scripts for module loading

### Modules (loaded via content_scripts)
- **dataExtractor.js**: Data parsing and validation logic for training module extraction from DOM
- **styles.js**: CSS constants for both print and mobile formatting (PRINT_STYLES, MOBILE_STYLES)
- **utils.js**: Shared utility functions (filtering, notepad generation, file downloads, print window management)
- **printFormatter.js**: Print-specific HTML generation and A4 layout formatting
- **mobileFormatter.js**: Mobile-specific HTML generation with localStorage, auto-save, and export functionality

### Load Order
Modules are loaded in dependency order: utils.js → styles.js → dataExtractor.js → printFormatter.js → mobileFormatter.js → content.js

## Key Functionality
The extension follows a popup → content script communication pattern:
1. Popup extracts module data using `getTrainingModules()` function injected into active tab
2. User selects modules, formatting options, and output format (print vs mobile) in popup
3. Popup sends options via `chrome.tabs.sendMessage()` to content script
4. Content script coordinates modules to generate output:
   - **Data Extraction**: `TrainingDataExtractor.extractTrainingData()` parses DOM and validates elements
   - **Print Format**: `TrainingPrintFormatter.formatForPrint()` generates A4-optimized HTML in new window
   - **Mobile Format**: `TrainingMobileFormatter.formatForMobile()` creates downloadable HTML with localStorage functionality

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

## Module Communication
- Modules expose functionality via `window` globals (e.g., `window.TrainingDataExtractor`)
- Dependencies: printFormatter.js and mobileFormatter.js depend on utils.js, styles.js, and dataExtractor.js
- Error handling is centralized in dataExtractor.js with user-friendly alerts
- All modules use consistent JSDoc documentation for function signatures

## Code Organization
- **Single Responsibility**: Each module handles one specific aspect (data, styling, formatting, utilities)
- **Dependency Injection**: Modules access dependencies via window globals rather than imports
- **Consistent Patterns**: All formatters follow similar structure with generate→format→handle workflow
- **Shared Utilities**: Common functionality (filtering, file operations) centralized in utils.js