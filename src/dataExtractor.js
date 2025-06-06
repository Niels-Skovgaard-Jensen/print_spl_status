/**
 * Data extraction module for training status pages
 * Handles parsing and validation of training module data from the DOM
 */

/**
 * Validates that required elements exist on the page
 * @param {HTMLElement} bodyContent - The main content container
 * @returns {Object|null} Object with elements or null if validation fails
 */
function validatePageElements(bodyContent) {
  if (!bodyContent) {
    alert('Training status content not found on this page.');
    return null;
  }

  const mainTitleElement = bodyContent.querySelector('h2');
  const pilotInfoElement = bodyContent.querySelector('h3');
  const tableElement = bodyContent.querySelector('table');

  if (!mainTitleElement || !pilotInfoElement || !tableElement) {
    alert('Required elements (h2, h3, table) for training status not found.');
    return null;
  }

  return {
    mainTitleElement,
    pilotInfoElement,
    tableElement,
    mainTitle: mainTitleElement.innerText.trim(),
    pilotInfo: pilotInfoElement.innerText.trim()
  };
}

/**
 * Parses training modules from the table element
 * @param {HTMLElement} tableElement - The table containing training data
 * @returns {Array} Array of training modules
 */
function parseTrainingModules(tableElement) {
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

  return trainingModules;
}

/**
 * Extracts training module data from the page table
 * @returns {Object|null} Object containing extracted data or null if extraction fails
 */
function extractTrainingData() {
  const bodyContent = document.querySelector('.container.body-content');
  const elements = validatePageElements(bodyContent);
  
  if (!elements) {
    return null;
  }

  const { mainTitle, pilotInfo, tableElement } = elements;
  const trainingModules = parseTrainingModules(tableElement);

  return {
    mainTitle,
    pilotInfo,
    trainingModules
  };
}

// Export functions for module usage
window.TrainingDataExtractor = {
  extractTrainingData,
  validatePageElements,
  parseTrainingModules
};