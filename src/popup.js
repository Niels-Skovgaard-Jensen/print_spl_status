// Initialization - wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Query the active tab to get training modules
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      document.getElementById('moduleCheckboxes').innerHTML = 'No active tab found';
      return;
    }
    
    // Inject a script to extract module info
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: getTrainingModules
    }, (results) => {
      if (!results || !results[0] || !results[0].result) {
        document.getElementById('moduleCheckboxes').innerHTML = 'Module data not found on this page';
        return;
      }
      
      const modules = results[0].result;
      populateModuleCheckboxes(modules);
    });
  });
  
  // Handle checkbox actions
  document.getElementById('selectAll').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
  });
  
  document.getElementById('selectNone').addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
  });
  
  // Handle format button click
  document.getElementById('formatButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        // Get selected module IDs
        const selectedModules = [];
        document.querySelectorAll('#moduleCheckboxes input[type="checkbox"]:checked').forEach(checkbox => {
          selectedModules.push(checkbox.value);
        });
        // Get other options
        const outputFormat = document.querySelector('input[name="outputFormat"]:checked').value;
        const useNotepad = document.getElementById('useNotepad').checked;
        const notepadSize = document.getElementById('notepadSize').value;
        const hideCompletedNorms = document.getElementById('hideCompletedNorms').checked;
        const notepadPlacement = document.querySelector('input[name="notepadPlacement"]:checked').value;
        // Execute content script with options
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          // After content script loads, send the options
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'formatTraining',
            options: {
              selectedModules,
              outputFormat,
              useNotepad,
              notepadSize,
              hideCompletedNorms,
              notepadPlacement
            }
          });
        });
      } else {
        console.error("No active tab found.");
      }
    });
  });

  // Enable/disable notepad size and placement select based on notepad checkbox
  const useNotepadCheckbox = document.getElementById('useNotepad');
  const notepadSizeSelect = document.getElementById('notepadSize');
  const notepadPlacementContainer = document.getElementById('notepadPlacementContainer');
  function updateNotepadControlsState() {
    notepadSizeSelect.disabled = !useNotepadCheckbox.checked;
    notepadPlacementContainer.style.opacity = useNotepadCheckbox.checked ? '1' : '0.5';
    Array.from(notepadPlacementContainer.querySelectorAll('input')).forEach(r => r.disabled = !useNotepadCheckbox.checked);
  }
  useNotepadCheckbox.addEventListener('change', updateNotepadControlsState);
  updateNotepadControlsState();
});

// Function to extract module IDs from the page
function getTrainingModules() {
  const moduleRows = Array.from(document.querySelectorAll('.container.body-content table tr td.clickable b'));
  return moduleRows.map(moduleTitle => {
    const text = moduleTitle.innerText.trim();
    const id = text.split('-')[0];
    return { id, text };
  });
}

// Function to populate module checkboxes
function populateModuleCheckboxes(modules) {
  if (!modules || modules.length === 0) {
    document.getElementById('moduleCheckboxes').innerHTML = 'No modules found on this page';
    return;
  }
  
  const container = document.getElementById('moduleCheckboxes');
  container.innerHTML = '';
  
  modules.forEach(module => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = module.id;
    checkbox.checked = false; // Default: not chosen
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${module.text}`));
    container.appendChild(label);
  });
}