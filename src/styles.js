/**
 * CSS styles module for training status formatting
 * Contains all styling constants for both print and mobile formats
 */

/**
 * CSS styles for print formatting
 */
const PRINT_STYLES = `
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
`;

/**
 * CSS styles for mobile formatting
 */
const MOBILE_STYLES = `
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
`;

// Export styles for module usage
window.TrainingStyles = {
  PRINT_STYLES,
  MOBILE_STYLES
};