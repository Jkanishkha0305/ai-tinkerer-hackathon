// Settings page script for AI Tinkerer Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  
  // Load saved settings
  loadSettings();
  
  // Add event listeners for all form elements
  const formElements = document.querySelectorAll('input, select');
  formElements.forEach(element => {
    element.addEventListener('change', saveSettings);
    element.addEventListener('input', saveSettings);
  });
  
  // Clear data button
  document.getElementById('clearData').addEventListener('click', clearAllData);
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.local.get([
      'mode', 'autoAnalyze', 'notifications', 'highlightColor', 
      'highlightOpacity', 'customKeywords', 'aiProvider', 
      'apiKey', 'model', 'dataCollection'
    ], function(result) {
      // Set form values
      document.getElementById('mode').value = result.mode || 'basic';
      document.getElementById('autoAnalyze').checked = result.autoAnalyze || false;
      document.getElementById('notifications').checked = result.notifications || false;
      document.getElementById('highlightColor').value = result.highlightColor || '#ffeb3b';
      document.getElementById('highlightOpacity').value = result.highlightOpacity || 0.8;
      document.getElementById('customKeywords').value = result.customKeywords || '';
      document.getElementById('aiProvider').value = result.aiProvider || 'openai';
      document.getElementById('apiKey').value = result.apiKey || '';
      document.getElementById('model').value = result.model || 'gpt-3.5-turbo';
      document.getElementById('dataCollection').checked = result.dataCollection || false;
      
      updateStatus('Settings loaded');
    });
  }
  
  // Save settings to storage
  function saveSettings() {
    const settings = {
      mode: document.getElementById('mode').value,
      autoAnalyze: document.getElementById('autoAnalyze').checked,
      notifications: document.getElementById('notifications').checked,
      highlightColor: document.getElementById('highlightColor').value,
      highlightOpacity: parseFloat(document.getElementById('highlightOpacity').value),
      customKeywords: document.getElementById('customKeywords').value,
      aiProvider: document.getElementById('aiProvider').value,
      apiKey: document.getElementById('apiKey').value,
      model: document.getElementById('model').value,
      dataCollection: document.getElementById('dataCollection').checked,
      lastUpdated: new Date().toISOString()
    };
    
    chrome.storage.local.set(settings, function() {
      updateStatus('Settings saved');
      
      // Notify background script of settings change
      chrome.runtime.sendMessage({
        action: 'settingsUpdated',
        settings: settings
      });
    });
  }
  
  // Clear all stored data
  function clearAllData() {
    if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      chrome.storage.local.clear(function() {
        updateStatus('All data cleared');
        
        // Reset form to defaults
        document.getElementById('mode').value = 'basic';
        document.getElementById('autoAnalyze').checked = false;
        document.getElementById('notifications').checked = false;
        document.getElementById('highlightColor').value = '#ffeb3b';
        document.getElementById('highlightOpacity').value = 0.8;
        document.getElementById('customKeywords').value = '';
        document.getElementById('aiProvider').value = 'openai';
        document.getElementById('apiKey').value = '';
        document.getElementById('model').value = 'gpt-3.5-turbo';
        document.getElementById('dataCollection').checked = false;
        
        // Re-save defaults
        setTimeout(saveSettings, 100);
      });
    }
  }
  
  // Update status message
  function updateStatus(message) {
    statusElement.textContent = message;
    setTimeout(() => {
      statusElement.textContent = 'Settings saved automatically';
    }, 3000);
  }
  
  // Handle API key security
  document.getElementById('apiKey').addEventListener('input', function() {
    // Mask API key in display
    if (this.value.length > 0) {
      this.type = 'password';
    } else {
      this.type = 'text';
    }
  });
  
  // Show/hide API key
  document.getElementById('apiKey').addEventListener('dblclick', function() {
    if (this.type === 'password') {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  });
  
  // Export settings
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      exportSettings();
    }
  });
  
  function exportSettings() {
    chrome.storage.local.get(null, function(items) {
      const dataStr = JSON.stringify(items, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-tinkerer-settings.json';
      link.click();
      URL.revokeObjectURL(url);
      updateStatus('Settings exported');
    });
  }
});
