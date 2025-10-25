// Background service worker for AI Tinkerer Chrome Extension

// Extension installation/startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('AI Tinkerer Extension installed/updated');
  
  // Set default settings
  chrome.storage.local.set({
    mode: 'basic',
    highlightColor: '#ffeb3b',
    autoAnalyze: false,
    lastPrompt: ''
  });
  
  // Create context menu items
  chrome.contextMenus.create({
    id: 'aiTinkererHighlight',
    title: '🤖 Highlight AI Content',
    contexts: ['selection', 'page']
  });
  
  chrome.contextMenus.create({
    id: 'aiTinkererAnalyze',
    title: '🔍 Analyze with AI',
    contexts: ['selection', 'page']
  });
  
  chrome.contextMenus.create({
    id: 'aiTinkererExtract',
    title: '📝 Extract Text',
    contexts: ['selection', 'page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'aiTinkererHighlight':
      chrome.tabs.sendMessage(tab.id, { action: 'highlightAI' });
      break;
    case 'aiTinkererAnalyze':
      chrome.tabs.sendMessage(tab.id, { action: 'analyzePage' });
      break;
    case 'aiTinkererExtract':
      chrome.tabs.sendMessage(tab.id, { action: 'extractText' });
      break;
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'getSettings':
      chrome.storage.local.get(['mode', 'highlightColor', 'autoAnalyze'], (result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'updateSettings':
      chrome.storage.local.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'processAI':
      // This is where you would integrate with AI APIs
      processAIRequest(request.data, sendResponse);
      return true;
      
    case 'logActivity':
      // Log user activity for analytics
      console.log('User activity:', request.data);
      sendResponse({ logged: true });
      break;
  }
});

// Process AI requests (placeholder for AI integration)
async function processAIRequest(data, sendResponse) {
  try {
    // This is where you would integrate with AI services like OpenAI, Claude, etc.
    // For now, we'll simulate AI processing
    const response = await simulateAIProcessing(data);
    sendResponse({ success: true, result: response });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Simulate AI processing (replace with actual AI API calls)
async function simulateAIProcessing(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        processed: true,
        timestamp: new Date().toISOString(),
        data: data,
        aiResponse: "This is a simulated AI response. Replace with actual AI API integration."
      });
    }, 1000);
  });
}

// Handle tab updates for auto-analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if auto-analyze is enabled
    chrome.storage.local.get(['autoAnalyze'], (result) => {
      if (result.autoAnalyze) {
        chrome.tabs.sendMessage(tabId, { action: 'autoAnalyze' });
      }
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  console.log('Extension icon clicked on tab:', tab.id);
});

// Periodic cleanup and maintenance
setInterval(() => {
  // Clean up old data, sync settings, etc.
  chrome.storage.local.get(null, (items) => {
    console.log('Extension storage:', Object.keys(items));
  });
}, 300000); // Every 5 minutes
