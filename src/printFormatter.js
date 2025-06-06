/**
 * Print formatting module for training status pages
 * Handles generation of print-optimized HTML documents
 */

/**
 * Generates HTML for a single module item in print format
 * @param {Object} item - The module item
 * @param {Object} options - Formatting options
 * @returns {string} HTML for the item
 */
function generatePrintModuleItem(item, options) {
  if (options.hideCompletedNorms && item.status === 'completed') return '';
  
  let itemHtml = `
    <li class="module-item status-${item.status}">
      <span class="checkmark">${item.status === 'completed' ? '✓' : ''}</span>
      <span class="status-indicator"></span>
      <span class="module-item-text">${item.text}</span>
    </li>
  `;
  
  // Add notepad for sub-norm if needed
  if (item.status !== 'completed' && options.useNotepad !== false && options.notepadPlacement !== 'major') {
    itemHtml += window.TrainingUtils.generateNotepadHTML(options.notepadSize, 'notepad-subnorm');
  }
  
  return itemHtml;
}

/**
 * Generates HTML for a module in print format
 * @param {Object} module - The module data
 * @param {Object} options - Formatting options
 * @returns {string} HTML for the module
 */
function generatePrintModule(module, options) {
  let moduleHtml = `
    <div class="module">
      <div class="module-title status-${module.status}">
        <span>${module.title}</span>
        <span class="status-text-badge">${module.status.replace('-', ' ')}</span>
      </div>
  `;
  
  if (module.items.length > 0) {
    moduleHtml += `<ul class="module-items">`;
    let hasNotCompleted = false;
    
    module.items.forEach(item => {
      moduleHtml += generatePrintModuleItem(item, options);
      if (item.status !== 'completed') hasNotCompleted = true;
    });
    
    moduleHtml += `</ul>`;
    
    // Add notepad for major norm if needed
    if (hasNotCompleted && options.useNotepad !== false && options.notepadPlacement === 'major') {
      moduleHtml += window.TrainingUtils.generateNotepadHTML(options.notepadSize, 'notepad-major');
    }
  }
  
  moduleHtml += `</div>`;
  return moduleHtml;
}

/**
 * Generates complete HTML document for print format
 * @param {string} mainTitle - Page title
 * @param {string} pilotInfo - Pilot information
 * @param {Array} modules - Array of modules
 * @param {Object} options - Formatting options
 * @returns {string} Complete HTML document
 */
function generatePrintHTML(mainTitle, pilotInfo, modules, options) {
  const printScript = `
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
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Printable Training Status - ${pilotInfo.split('-')[0].trim()}</title>
      <style>${window.TrainingStyles.PRINT_STYLES}</style>
    </head>
    <body>
      <div class="print-container">
        <h1>${mainTitle}</h1>
        <h2 class="pilot-info">${pilotInfo}</h2>
        <div class="print-actions">
          <button onclick="window.print()">Print this page</button>
        </div>
        ${modules.map(module => generatePrintModule(module, options)).join('')}
      </div>
      <script>${printScript}</script>
    </body>
    </html>
  `;
}

/**
 * Main function to format the training page for printing
 * @param {Object} trainingData - Extracted training data
 * @param {Object} options - Formatting options
 */
function formatForPrint(trainingData, options = { selectedModules: [], useCheckmarks: true }) {
  const { mainTitle, pilotInfo, trainingModules } = trainingData;
  const filteredModules = window.TrainingUtils.filterModules(trainingModules, options.selectedModules);
  const printHtml = generatePrintHTML(mainTitle, pilotInfo, filteredModules, options);
  
  window.TrainingUtils.handlePrintWindow(printHtml);
}

// Export functions for module usage
window.TrainingPrintFormatter = {
  formatForPrint,
  generatePrintHTML,
  generatePrintModule,
  generatePrintModuleItem
};