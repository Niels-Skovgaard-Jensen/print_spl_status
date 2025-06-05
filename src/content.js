(() => {
  // Set up message listener to receive options from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'formatTraining') {
      if (message.options.outputFormat === 'mobile') {
        formatTrainingPageMobile(message.options);
      } else {
        formatTrainingPage(message.options);
      }
    }
    return true;
  });

  // Main function to format the training page
  function formatTrainingPage(options = { selectedModules: [], useCheckmarks: true }) {
    // --- Data Extraction ---
    const bodyContent = document.querySelector('.container.body-content');
    if (!bodyContent) {
      alert('Training status content not found on this page.');
      return;
    }

    const mainTitleElement = bodyContent.querySelector('h2');
    const pilotInfoElement = bodyContent.querySelector('h3');
    const tableElement = bodyContent.querySelector('table');

    if (!mainTitleElement || !pilotInfoElement || !tableElement) {
      alert('Required elements (h2, h3, table) for training status not found.');
      return;
    }

    const mainTitle = mainTitleElement.innerText.trim();
    const pilotInfo = pilotInfoElement.innerText.trim();
    const trainingModules = [];

    let currentModule = null;
    const rows = Array.from(tableElement.querySelectorAll('tr'));

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return; // Skip spacer rows or malformed rows

      const firstCell = cells[0];
      const moduleTitleElement = firstCell.querySelector('b');

      if (moduleTitleElement) { // This is a main module row
        if (currentModule) {
          trainingModules.push(currentModule);
        }
        const statusClass = firstCell.className.match(/status-[\w-]+/)?.[0] || 'status-unknown';
        const moduleTitle = moduleTitleElement.innerText.trim();
        const moduleId = moduleTitle.split('-')[0]; // Extract G1, G2, etc.
        
        currentModule = {
          id: moduleId,
          title: moduleTitle,
          status: statusClass.replace('status-', ''),
          items: []
        };
      } else if (currentModule && firstCell.style.paddingLeft === '30px') { // This is a sub-item row
        const statusClass = firstCell.className.match(/status-[\w-]+/)?.[0] || 'status-unknown';
        currentModule.items.push({
          text: firstCell.innerText.trim(),
          status: statusClass.replace('status-', '')
        });
      }
    });

    if (currentModule) { // Add the last processed module
      trainingModules.push(currentModule);
    }

    // Filter modules based on user selection
    const filteredModules = options.selectedModules && options.selectedModules.length > 0
      ? trainingModules.filter(module => options.selectedModules.includes(module.id))
      : trainingModules;

    // --- HTML Generation for Print ---
    let printHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Printable Training Status - ${pilotInfo.split('-')[0].trim()}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 2cm 1.5cm; /* Top/Bottom, Left/Right */
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            font-size: 10pt; /* Base font size */
          }
          .print-container {
            width: 100%;
          }
          h1 {
            text-align: center;
            font-size: 18pt;
            margin-bottom: 5px;
            color: #005a87; /* A darker blue */
          }
          h2.pilot-info {
            text-align: center;
            font-size: 12pt;
            font-weight: normal;
            margin-top: 0;
            margin-bottom: 25px;
            color: #555;
          }
          .module {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
            page-break-inside: avoid; /* Try to keep module and its items on one page */
          }
          .module:last-child {
            border-bottom: none;
          }
          .module-title {
            font-size: 13pt;
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .module-items {
            list-style-type: none;
            padding-left: 0; /* Remove default ul padding */
          }
          .module-item {
            padding-left: 20px; /* Indent sub-items */
            margin-bottom: 4px;
            display: flex;
            align-items: center;
          }
          .status-indicator {
            min-width: 12px; /* Use min-width to ensure it's always visible */
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
            flex-shrink: 0;
            border: 1px solid transparent; /* Base border */
          }
          .status-text-badge { /* For module titles */
              font-style: italic;
              font-size: 9pt;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: capitalize;
          }

          /* Status specific styling */
          .status-completed .status-indicator { background-color: #28a745; border-color: #1e7e34;}
          .status-in-progress .status-indicator { background-color: #ffc107; border-color: #d39e00;}
          .status-not-started .status-indicator { background-color: #dc3545; border-color: #b02a37;}
          .status-unknown .status-indicator { background-color: #adb5bd; border-color: #828a91;}

          .status-completed .status-text-badge { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;}
          .status-in-progress .status-text-badge { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;}
          .status-not-started .status-text-badge { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;}
          .status-unknown .status-text-badge { background-color: #e2e3e5; color: #383d41; border: 1px solid #d6d8db;}
          
          /* Checkmarks for completed items */
          .checkmark {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 16px;
            height: 16px;
            margin-right: 8px;
            flex-shrink: 0;
            font-size: 12px;
          }
          .status-completed .checkmark {
            color: #28a745;
            font-weight: bold;
          }
          .status-not-started .checkmark,
          .status-in-progress .checkmark {
            color: transparent;
          }
          
          /* Module title color can reflect status slightly for quick glance */
          .module-title.status-completed { /* color: #155724; */ }
          .module-title.status-in-progress { /* color: #856404; */ }
          .module-title.status-not-started { /* color: #721c24; */ }
          
          .module-item-text {
            flex-grow: 1;
          }

          /* Header and Footer for printing */
          @media print {
            header, footer { display: none; } /* Hide web headers/footers */
            body::after {
              content: "Page " counter(page); /* Using just counter(page) as counter(pages) can be unreliable */
              position: fixed;
              bottom: 0.5cm;
              right: 1.5cm;
              font-size: 8pt;
              color: #888;
            }
            
            /* Ensure status indicators are filled when printing */
            .status-indicator {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Ensure status badges have proper colors when printing */
            .status-text-badge {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          /* Print button */
          .print-actions {
            text-align: center;
            margin: 20px 0;
            padding-bottom: 20px;
          }
          .print-actions button {
            padding: 8px 15px;
            background-color: #005a87;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
          }
          .print-actions button:hover {
            background-color: #0078b8;
          }
          @media print {
            .print-actions {
              display: none;
            }
          }
          /* Notepad area styling */
          .notepad-area {
            margin: 18px 0 8px 0;
            padding: 10px 12px 8px 12px;
            border: 1px dashed #bbb;
            border-radius: 6px;
            background: #fcfcfc;
            min-height: 60px;
            max-width: 600px;
          }
          .notepad-label {
            font-size: 10pt;
            color: #888;
            margin-bottom: 4px;
          }
          .notepad-lines {
            margin-top: 2px;
          }
          .notepad-line {
            border-bottom: 1px dotted #bbb;
            height: 18px;
            margin-bottom: 2px;
          }
          @media print {
            .notepad-area {
              background: none;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <h1>${mainTitle}</h1>
          <h2 class="pilot-info">${pilotInfo}</h2>
    `;

    // Add print button at the top (only visible on screen, not when printing)
    printHtml += `
      <div class="print-actions">
        <button onclick="window.print()">Print this page</button>
      </div>
    `;

    filteredModules.forEach(module => {
      printHtml += `
        <div class="module">
          <div class="module-title status-${module.status}">
            <span>${module.title}</span>
            <span class="status-text-badge">${module.status.replace('-', ' ')}</span>
          </div>
      `;
      if (module.items.length > 0) {
        printHtml += `<ul class="module-items">`;
        let hasNotCompleted = false;
        module.items.forEach(item => {
          if (options.hideCompletedNorms && item.status === 'completed') return;
          printHtml += `
            <li class="module-item status-${item.status}">
              <span class="checkmark">${item.status === 'completed' ? '✓' : ''}</span>
              <span class="status-indicator"></span>
              <span class="module-item-text">${item.text}</span>
            </li>
          `;
          if (item.status !== 'completed') hasNotCompleted = true;
          // Only add notepad for sub-norm if placement is 'sub'
          if (item.status !== 'completed' && options.useNotepad !== false && options.notepadPlacement !== 'major') {
            let lines = 5;
            if (options.notepadSize === 'small') lines = 2;
            else if (options.notepadSize === 'large') lines = 10;
            printHtml += `
              <div class=\"notepad-area notepad-subnorm\">
                <div class=\"notepad-label\">Noter:</div>
                <div class=\"notepad-lines\">
                  ${Array.from({length: lines}).map(() => '<div class=\"notepad-line\"></div>').join('')}
                </div>
              </div>
            `;
          }
        });
        printHtml += `</ul>`;
        // Add notepad for major norm if placement is 'major' and any sub-norm is not completed
        if (hasNotCompleted && options.useNotepad !== false && options.notepadPlacement === 'major') {
          let lines = 5;
          if (options.notepadSize === 'small') lines = 2;
          else if (options.notepadSize === 'large') lines = 10;
          printHtml += `
            <div class=\"notepad-area notepad-major\">
              <div class=\"notepad-label\">Noter:</div>
              <div class=\"notepad-lines\">
                ${Array.from({length: lines}).map(() => '<div class=\"notepad-line\"></div>').join('')}
              </div>
            </div>
          `;
        }
      }
      printHtml += `</div>`;
    });

    printHtml += `
        </div>
      </body>
      <script>
        // Ensure first module starts on first page
        window.addEventListener('DOMContentLoaded', function() {
          var firstModule = document.querySelector('.module');
          if (firstModule) {
            firstModule.style.pageBreakBefore = 'always';
            // Remove page break if it's already at the top
            var rect = firstModule.getBoundingClientRect();
            if (rect.top < 100) {
              firstModule.style.pageBreakBefore = '';
            }
          }
        });
      </script>
      </html>
    `;

    // --- Print or Display Logic ---
    if (window._splPrintWindow && !window._splPrintWindow.closed) {
      try { window._splPrintWindow.close(); } catch (e) {}
    }
    const printWindow = window.open('', '_blank');
    window._splPrintWindow = printWindow;
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      window._splPrintWindow = null;
    }, 500);
  }

  // Mobile format function with localStorage persistence
  function formatTrainingPageMobile(options = { selectedModules: [], useNotepad: true }) {
    // --- Data Extraction (same as print version) ---
    const bodyContent = document.querySelector('.container.body-content');
    if (!bodyContent) {
      alert('Training status content not found on this page.');
      return;
    }

    const mainTitleElement = bodyContent.querySelector('h2');
    const pilotInfoElement = bodyContent.querySelector('h3');
    const tableElement = bodyContent.querySelector('table');

    if (!mainTitleElement || !pilotInfoElement || !tableElement) {
      alert('Required elements (h2, h3, table) for training status not found.');
      return;
    }

    const mainTitle = mainTitleElement.innerText.trim();
    const pilotInfo = pilotInfoElement.innerText.trim();
    const trainingModules = [];

    let currentModule = null;
    const rows = Array.from(tableElement.querySelectorAll('tr'));

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;

      const firstCell = cells[0];
      const moduleTitleElement = firstCell.querySelector('b');

      if (moduleTitleElement) {
        if (currentModule) {
          trainingModules.push(currentModule);
        }
        const statusClass = firstCell.className.match(/status-[\w-]+/)?.[0] || 'status-unknown';
        const moduleTitle = moduleTitleElement.innerText.trim();
        const moduleId = moduleTitle.split('-')[0];
        
        currentModule = {
          id: moduleId,
          title: moduleTitle,
          status: statusClass.replace('status-', ''),
          items: []
        };
      } else if (currentModule && firstCell.style.paddingLeft === '30px') {
        const statusClass = firstCell.className.match(/status-[\w-]+/)?.[0] || 'status-unknown';
        currentModule.items.push({
          text: firstCell.innerText.trim(),
          status: statusClass.replace('status-', '')
        });
      }
    });

    if (currentModule) {
      trainingModules.push(currentModule);
    }

    // Filter modules based on user selection
    const filteredModules = options.selectedModules && options.selectedModules.length > 0
      ? trainingModules.filter(module => options.selectedModules.includes(module.id))
      : trainingModules;

    // Generate unique document ID for localStorage
    const docId = `spl_training_${pilotInfo.split('-')[0].trim().replace(/\s+/g, '_')}_${Date.now()}`;

    // --- Mobile HTML Generation ---
    const mobileHtml = generateMobileHTML(mainTitle, pilotInfo, filteredModules, options, docId);

    // Create blob and download
    const blob = new Blob([mobileHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training_status_mobile_${pilotInfo.split('-')[0].trim().replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Mobile training document downloaded! Open it on your phone to edit notes.');
  }

  function generateMobileHTML(mainTitle, pilotInfo, modules, options, docId) {
    let itemIndex = 0;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>Training Status - ${pilotInfo.split('-')[0].trim()}</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 15px;
      background: #f8f9fa;
      font-size: 16px;
    }
    .container {
      max-width: 100%;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 8px;
      color: #005a87;
      font-weight: 600;
    }
    .pilot-info {
      text-align: center;
      font-size: 18px;
      margin-bottom: 25px;
      color: #666;
      font-weight: 500;
    }
    .module {
      margin-bottom: 25px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .module-header {
      background: #f1f3f4;
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    .module-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .status-badge {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: capitalize;
      font-weight: 500;
    }
    .status-completed .status-badge { background: #d4edda; color: #155724; }
    .status-in-progress .status-badge { background: #fff3cd; color: #856404; }
    .status-not-started .status-badge { background: #f8d7da; color: #721c24; }
    .status-unknown .status-badge { background: #e2e3e5; color: #383d41; }
    
    .module-items {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .module-item {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .module-item:last-child {
      border-bottom: none;
    }
    .status-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .status-completed .status-indicator { background: #28a745; }
    .status-in-progress .status-indicator { background: #ffc107; }
    .status-not-started .status-indicator { background: #dc3545; }
    .status-unknown .status-indicator { background: #6c757d; }
    
    .item-content {
      flex: 1;
    }
    .item-text {
      margin-bottom: 8px;
      font-weight: 500;
    }
    .notes-area {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      min-height: 80px;
      margin-top: 8px;
    }
    .notes-textarea {
      width: 100%;
      min-height: 80px;
      padding: 12px;
      border: none;
      background: transparent;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
    }
    .notes-textarea:focus {
      outline: 2px solid #005a87;
      outline-offset: -2px;
    }
    .controls {
      position: sticky;
      top: 0;
      background: white;
      padding: 15px;
      border-bottom: 2px solid #005a87;
      margin: -20px -20px 20px -20px;
      z-index: 100;
    }
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .btn-primary {
      background: #005a87;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    .btn-success {
      background: #28a745;
      color: white;
    }
    .auto-save-status {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
    .export-section {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }
    .export-section h3 {
      margin-top: 0;
      font-size: 16px;
      color: #005a87;
    }
    #importFile {
      margin: 8px 0;
    }
    @media (max-width: 480px) {
      body { padding: 10px; }
      .container { padding: 15px; }
      h1 { font-size: 20px; }
      .pilot-info { font-size: 16px; }
      .module-title { font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="controls">
      <button class="btn btn-primary" onclick="saveAllNotes()">💾 Save All</button>
      <button class="btn btn-secondary" onclick="exportData()">📤 Export</button>
      <button class="btn btn-success" onclick="document.getElementById('importFile').click()">📥 Import</button>
      <input type="file" id="importFile" accept=".json" style="display: none;" onchange="importData(event)">
      <div class="auto-save-status" id="autoSaveStatus">Auto-save: Ready</div>
    </div>
    
    <h1>${mainTitle}</h1>
    <div class="pilot-info">${pilotInfo}</div>
    
    ${modules.map(module => {
      let moduleHtml = `
        <div class="module status-${module.status}">
          <div class="module-header">
            <div class="module-title">
              <span>${module.title}</span>
              <span class="status-badge">${module.status.replace('-', ' ')}</span>
            </div>
          </div>
      `;
      
      if (module.items.length > 0) {
        moduleHtml += `<ul class="module-items">`;
        module.items.forEach(item => {
          if (options.hideCompletedNorms && item.status === 'completed') return;
          
          const textareaId = `notes_${itemIndex}`;
          moduleHtml += `
            <li class="module-item status-${item.status}">
              <div class="status-indicator"></div>
              <div class="item-content">
                <div class="item-text">${item.text}</div>
                ${item.status !== 'completed' && options.useNotepad !== false ? `
                  <div class="notes-area">
                    <textarea 
                      class="notes-textarea" 
                      id="${textareaId}"
                      placeholder="Add your notes here..."
                      oninput="autoSave('${textareaId}')"
                    ></textarea>
                  </div>
                ` : ''}
              </div>
            </li>
          `;
          itemIndex++;
        });
        moduleHtml += `</ul>`;
      }
      
      moduleHtml += `</div>`;
      return moduleHtml;
    }).join('')}
    
    <div class="export-section">
      <h3>Data Management</h3>
      <p>Your notes are automatically saved to your device. Use Export to backup your data or Import to restore from a backup.</p>
      <button class="btn btn-secondary" onclick="clearAllData()">🗑️ Clear All Data</button>
    </div>
  </div>

  <script>
    const DOC_ID = '${docId}';
    let autoSaveTimeout;
    
    // Load saved data on page load
    window.addEventListener('DOMContentLoaded', function() {
      loadAllNotes();
    });
    
    function autoSave(textareaId) {
      clearTimeout(autoSaveTimeout);
      const status = document.getElementById('autoSaveStatus');
      status.textContent = 'Auto-save: Saving...';
      status.style.color = '#856404';
      
      autoSaveTimeout = setTimeout(() => {
        saveNote(textareaId);
        status.textContent = 'Auto-save: Saved ✓';
        status.style.color = '#155724';
        
        setTimeout(() => {
          status.textContent = 'Auto-save: Ready';
          status.style.color = '#666';
        }, 2000);
      }, 1000);
    }
    
    function saveNote(textareaId) {
      const textarea = document.getElementById(textareaId);
      if (textarea) {
        const key = DOC_ID + '_' + textareaId;
        localStorage.setItem(key, textarea.value);
      }
    }
    
    function loadNote(textareaId) {
      const key = DOC_ID + '_' + textareaId;
      const savedValue = localStorage.getItem(key);
      if (savedValue) {
        const textarea = document.getElementById(textareaId);
        if (textarea) {
          textarea.value = savedValue;
        }
      }
    }
    
    function saveAllNotes() {
      const textareas = document.querySelectorAll('.notes-textarea');
      textareas.forEach(textarea => {
        const key = DOC_ID + '_' + textarea.id;
        localStorage.setItem(key, textarea.value);
      });
      
      // Also save metadata
      const metadata = {
        docId: DOC_ID,
        title: '${mainTitle}',
        pilot: '${pilotInfo}',
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(DOC_ID + '_metadata', JSON.stringify(metadata));
      
      alert('All notes saved successfully!');
    }
    
    function loadAllNotes() {
      const textareas = document.querySelectorAll('.notes-textarea');
      textareas.forEach(textarea => {
        loadNote(textarea.id);
      });
    }
    
    function exportData() {
      const data = {
        metadata: {
          docId: DOC_ID,
          title: '${mainTitle}',
          pilot: '${pilotInfo}',
          exportDate: new Date().toISOString()
        },
        notes: {}
      };
      
      const textareas = document.querySelectorAll('.notes-textarea');
      textareas.forEach(textarea => {
        const key = DOC_ID + '_' + textarea.id;
        const value = localStorage.getItem(key);
        if (value) {
          data.notes[textarea.id] = value;
        }
      });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'training_notes_' + DOC_ID + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    function importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.notes) {
            Object.entries(data.notes).forEach(([textareaId, value]) => {
              const textarea = document.getElementById(textareaId);
              if (textarea) {
                textarea.value = value;
                const key = DOC_ID + '_' + textareaId;
                localStorage.setItem(key, value);
              }
            });
            alert('Notes imported successfully!');
          } else {
            alert('Invalid import file format.');
          }
        } catch (error) {
          alert('Error importing file: ' + error.message);
        }
      };
      reader.readAsText(file);
      
      // Reset file input
      event.target.value = '';
    }
    
    function clearAllData() {
      if (confirm('Are you sure you want to clear all saved notes? This cannot be undone.')) {
        const textareas = document.querySelectorAll('.notes-textarea');
        textareas.forEach(textarea => {
          const key = DOC_ID + '_' + textarea.id;
          localStorage.removeItem(key);
          textarea.value = '';
        });
        localStorage.removeItem(DOC_ID + '_metadata');
        alert('All data cleared.');
      }
    }
  </script>
</body>
</html>`;
  }
})();