/**
 * Mobile formatting module for training status pages
 * Handles generation of mobile-optimized HTML documents with localStorage functionality
 */

/**
 * Generates HTML for a single module item in mobile format
 * @param {Object} item - The module item
 * @param {Object} options - Formatting options
 * @param {number} itemIndex - Index for unique IDs
 * @returns {Object} Object with HTML and updated index
 */
function generateMobileModuleItem(item, options, itemIndex) {
  if (options.hideCompletedNorms && item.status === 'completed') {
    return { html: '', itemIndex };
  }
  
  const textareaId = `notes_${itemIndex}`;
  const html = `
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
  
  return { html, itemIndex: itemIndex + 1 };
}

/**
 * Generates HTML for a module in mobile format
 * @param {Object} module - The module data
 * @param {Object} options - Formatting options
 * @param {number} itemIndex - Starting index for unique IDs
 * @returns {Object} Object with HTML and updated index
 */
function generateMobileModule(module, options, itemIndex) {
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
      const result = generateMobileModuleItem(item, options, itemIndex);
      moduleHtml += result.html;
      itemIndex = result.itemIndex;
    });
    
    moduleHtml += `</ul>`;
  }
  
  moduleHtml += `</div>`;
  return { html: moduleHtml, itemIndex };
}

/**
 * Generates JavaScript for mobile document functionality
 * @param {string} docId - Document ID for localStorage
 * @param {string} mainTitle - Page title
 * @param {string} pilotInfo - Pilot information
 * @returns {string} JavaScript code
 */
function generateMobileScript(docId, mainTitle, pilotInfo) {
  return `
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
  `;
}

/**
 * Generates complete HTML document for mobile format
 * @param {string} mainTitle - Page title
 * @param {string} pilotInfo - Pilot information
 * @param {Array} modules - Array of modules
 * @param {Object} options - Formatting options
 * @param {string} docId - Document ID for localStorage
 * @returns {string} Complete HTML document
 */
function generateMobileHTML(mainTitle, pilotInfo, modules, options, docId) {
  let itemIndex = 0;
  let modulesHtml = '';
  
  modules.forEach(module => {
    const result = generateMobileModule(module, options, itemIndex);
    modulesHtml += result.html;
    itemIndex = result.itemIndex;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>Training Status - ${pilotInfo.split('-')[0].trim()}</title>
  <style>${window.TrainingStyles.MOBILE_STYLES}</style>
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
    
    ${modulesHtml}
    
    <div class="export-section">
      <h3>Data Management</h3>
      <p>Your notes are automatically saved to your device. Use Export to backup your data or Import to restore from a backup.</p>
      <button class="btn btn-secondary" onclick="clearAllData()">🗑️ Clear All Data</button>
    </div>
  </div>

  <script>${generateMobileScript(docId, mainTitle, pilotInfo)}</script>
</body>
</html>`;
}

/**
 * Main function to format the training page for mobile
 * @param {Object} trainingData - Extracted training data
 * @param {Object} options - Formatting options
 */
function formatForMobile(trainingData, options = { selectedModules: [], useNotepad: true }) {
  const { mainTitle, pilotInfo, trainingModules } = trainingData;
  const filteredModules = window.TrainingUtils.filterModules(trainingModules, options.selectedModules);
  
  // Generate unique document ID for localStorage
  const docId = `spl_training_${pilotInfo.split('-')[0].trim().replace(/\s+/g, '_')}_${Date.now()}`;
  const mobileHtml = generateMobileHTML(mainTitle, pilotInfo, filteredModules, options, docId);
  const filename = `training_status_mobile_${pilotInfo.split('-')[0].trim().replace(/\s+/g, '_')}.html`;
  
  window.TrainingUtils.downloadHTMLFile(mobileHtml, filename);
  alert('Mobile training document downloaded! Open it on your phone to edit notes.');
}

// Export functions for module usage
window.TrainingMobileFormatter = {
  formatForMobile,
  generateMobileHTML,
  generateMobileModule,
  generateMobileModuleItem,
  generateMobileScript
};