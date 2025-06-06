/**
 * Main content script for SPL Training Status Chrome Extension
 * Coordinates all modules and handles message passing from popup
 */

(() => {
  /**
   * Sets up message listener to receive options from popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'formatTraining') {
      handleFormatTraining(message.options);
    }
    return true;
  });

  /**
   * Main handler for formatting training data
   * Routes to appropriate formatter based on output format
   * @param {Object} options - Formatting options from popup
   */
  function handleFormatTraining(options) {
    // Extract training data from the page
    const trainingData = window.TrainingDataExtractor.extractTrainingData();
    
    if (!trainingData) {
      return; // Error already shown by extractor
    }

    // Route to appropriate formatter
    if (options.outputFormat === 'mobile') {
      window.TrainingMobileFormatter.formatForMobile(trainingData, options);
    } else {
      window.TrainingPrintFormatter.formatForPrint(trainingData, options);
    }
  }
})();