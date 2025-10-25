// Popup script for AI Tinkerer Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const aiPromptInput = document.getElementById('aiPrompt');
  
  // Update status
  function updateStatus(message) {
    statusElement.textContent = message;
    setTimeout(() => {
      statusElement.textContent = 'Ready to tinker!';
    }, 3000);
  }
  
  // Highlight AI content on the page
  document.getElementById('highlightText').addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'highlightAI' });
      updateStatus('AI content highlighted!');
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
  });
  
  // Analyze current page
  document.getElementById('analyzePage').addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });
      updateStatus('Page analysis started!');
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
  });
  
  // Extract text from page
  document.getElementById('extractText').addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractText' });
      if (response && response.text) {
        updateStatus(`Extracted ${response.text.length} characters`);
        // You could open a new tab with the extracted text
        chrome.tabs.create({ url: 'data:text/html,<pre>' + encodeURIComponent(response.text) + '</pre>' });
      }
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
  });
  
  // Process AI prompt
  document.getElementById('processPrompt').addEventListener('click', async function() {
    const prompt = aiPromptInput.value.trim();
    if (!prompt) {
      updateStatus('Please enter a prompt!');
      return;
    }
    
    try {
      // Store the prompt for processing
      await chrome.storage.local.set({ lastPrompt: prompt });
      updateStatus('Prompt stored for processing!');
      aiPromptInput.value = '';
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
  });
  
  // Open settings
  document.getElementById('openSettings').addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });
  
  // Toggle mode
  document.getElementById('toggleMode').addEventListener('click', async function() {
    try {
      const result = await chrome.storage.local.get(['mode']);
      const newMode = result.mode === 'advanced' ? 'basic' : 'advanced';
      await chrome.storage.local.set({ mode: newMode });
      updateStatus(`Mode switched to ${newMode}!`);
    } catch (error) {
      updateStatus('Error: ' + error.message);
    }
  });
  
  // Resume Filler functionality
  document.getElementById('detectForm').addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'detectForm' });
      if (response && response.success) {
        updateStatus(`Detected ${response.fieldCount} form fields!`);
      } else {
        updateStatus('No form fields detected');
      }
    } catch (error) {
      updateStatus('Error detecting form: ' + error.message);
    }
  });
  
  document.getElementById('fillForm').addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
      updateStatus('Starting form fill...');
    } catch (error) {
      updateStatus('Error filling form: ' + error.message);
    }
  });
  
  document.getElementById('manageProfile').addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('profile.html') });
  });
  
  // Load saved settings
  chrome.storage.local.get(['mode'], function(result) {
    if (result.mode) {
      updateStatus(`Mode: ${result.mode}`);
    }
  });
});
