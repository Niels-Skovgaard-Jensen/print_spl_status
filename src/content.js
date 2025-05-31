(() => {
  // Set up message listener to receive options from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'formatTraining') {
      formatTrainingPage(message.options);
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
})();