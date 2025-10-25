// Popup script for AI Form Filler with Voice Chat

let isRecording = false;
let recognition = null;

document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const voiceBtn = document.getElementById('voiceBtn');
  const sendBtn = document.getElementById('sendBtn');

  // Initialize speech recognition
  initSpeechRecognition();

  // Update status
  function updateStatus(message) {
    statusElement.textContent = message;
  }

  // Add message to chat
  function addMessage(text, type = 'user') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Initialize Speech Recognition
  function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        isRecording = true;
        voiceBtn.classList.add('recording');
        updateStatus('🎤 Listening...');
      };

      recognition.onend = function() {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        updateStatus('Ready • Listening for forms...');
      };

      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        addMessage(transcript, 'user');
        sendMessageToAI(transcript);
      };

      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        updateStatus('Voice error: ' + event.error);
        isRecording = false;
        voiceBtn.classList.remove('recording');
      };
    } else {
      console.log('Speech recognition not supported');
      voiceBtn.disabled = true;
      voiceBtn.title = 'Voice input not supported in this browser';
    }
  }

  // Voice button click
  voiceBtn.addEventListener('click', function() {
    if (!recognition) {
      addMessage('Voice input not supported in this browser', 'system');
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  // Send button click
  sendBtn.addEventListener('click', function() {
    const message = chatInput.value.trim();
    if (message) {
      addMessage(message, 'user');
      sendMessageToAI(message);
      chatInput.value = '';
    }
  });

  // Enter key to send
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });

  // Send message to AI backend
  async function sendMessageToAI(message) {
    try {
      updateStatus('💭 Thinking...');

      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Send to content script to get page context
      let pageContext = {};
      try {
        pageContext = await chrome.tabs.sendMessage(tab.id, {
          action: 'getPageContext'
        });
      } catch (e) {
        console.log('Could not get page context:', e);
      }

      // Send to backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          page_url: tab.url,
          page_context: pageContext
        })
      });

      const data = await response.json();

      if (data.success) {
        addMessage(data.response, 'ai');
        updateStatus('Ready • Listening for forms...');

        // If AI suggests an action, execute it
        if (data.action) {
          executeAIAction(data.action);
        }
      } else {
        addMessage('Sorry, I encountered an error: ' + data.error, 'system');
        updateStatus('Error occurred');
      }

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('Could not connect to AI. Make sure backend is running at localhost:8000', 'system');
      updateStatus('⚠️ Connection error');
    }
  }

  // Execute AI-suggested actions
  async function executeAIAction(action) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    switch(action.type) {
      case 'fill_form':
        await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
        addMessage('Filling form now...', 'system');
        break;
      case 'fill_field':
        await chrome.tabs.sendMessage(tab.id, {
          action: 'fillField',
          field: action.field,
          value: action.value
        });
        break;
      case 'click_element':
        await chrome.tabs.sendMessage(tab.id, {
          action: 'clickElement',
          selector: action.selector
        });
        break;
    }
  }

  // Auto-Fill Form button
  document.getElementById('fillForm').addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
      updateStatus('✨ Starting form fill...');
      addMessage('Auto-filling form...', 'system');
    } catch (error) {
      updateStatus('Error filling form: ' + error.message);
      addMessage('Error: ' + error.message, 'system');
    }
  });

  // Manage Profile button
  document.getElementById('manageProfile').addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('profile.html') });
  });

  // Listen for messages from content script (form detection updates)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'formDetected') {
      updateStatus(`✅ Form detected: ${request.fieldCount} fields`);
      addMessage(`Found ${request.fieldCount} fields on this page. Ready to fill!`, 'system');
    } else if (request.action === 'formFilled') {
      updateStatus('🎉 Form filled successfully!');
      addMessage('Form filled successfully! 🎉', 'system');
    }
  });

  // Load initial status
  updateStatus('Ready • Listening for forms...');
});
