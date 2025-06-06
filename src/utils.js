/**
 * Utilities module for common functionality
 * Contains shared utility functions used across the application
 */

/**
 * Filters modules based on user selection
 * @param {Array} modules - Array of all modules
 * @param {Array} selectedModules - Array of selected module IDs
 * @returns {Array} Filtered array of modules
 */
function filterModules(modules, selectedModules) {
  return selectedModules && selectedModules.length > 0
    ? modules.filter(module => selectedModules.includes(module.id))
    : modules;
}

/**
 * Generates notepad HTML based on options
 * @param {string} size - Size of notepad (small, medium, large)
 * @param {string} cssClass - CSS class for styling
 * @returns {string} HTML for notepad area
 */
function generateNotepadHTML(size = 'medium', cssClass = '') {
  let lines = 5;
  if (size === 'small') lines = 2;
  else if (size === 'large') lines = 10;

  return `
    <div class="notepad-area ${cssClass}">
      <div class="notepad-label">Noter:</div>
      <div class="notepad-lines">
        ${Array.from({length: lines}).map(() => '<div class="notepad-line"></div>').join('')}
      </div>
    </div>
  `;
}

/**
 * Downloads HTML content as a file
 * @param {string} htmlContent - HTML content to download
 * @param {string} filename - Name of the file
 */
function downloadHTMLFile(htmlContent, filename) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Manages print window lifecycle
 * @param {string} htmlContent - HTML content to display
 */
function handlePrintWindow(htmlContent) {
  if (window._splPrintWindow && !window._splPrintWindow.closed) {
    try { window._splPrintWindow.close(); } catch (e) {}
  }
  
  const printWindow = window.open('', '_blank');
  window._splPrintWindow = printWindow;
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    window._splPrintWindow = null;
  }, 500);
}

// Export utilities for module usage
window.TrainingUtils = {
  filterModules,
  generateNotepadHTML,
  downloadHTMLFile,
  handlePrintWindow
};