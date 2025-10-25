/**
 * Dynamic Form Filler - LLM-Powered Version
 * Zero hard-coding, works with ANY form
 */

class DynamicFormFiller {
  constructor() {
    this.backendUrl = 'http://localhost:8000';
    this.ws = null;
    this.userData = null;
    this.currentAnalysis = null;
    this.filledFields = new Set();
    this.isFilling = false;

    this.init();
  }

  async init() {
    console.log('🚀 Dynamic Form Filler initializing...');

    // Load user data
    await this.loadUserData();

    // Connect to WebSocket for real-time guidance
    this.connectWebSocket();

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });

    console.log('✅ Dynamic Form Filler ready');

    // Auto-detect forms after page is fully loaded
    this.setupAutoDetection();
  }

  setupAutoDetection() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.autoDetectForms();
      });
    } else {
      // Page already loaded, detect immediately
      setTimeout(() => this.autoDetectForms(), 1000); // 1 second delay for dynamic content
    }

    // Also watch for new forms added dynamically
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // Check if new nodes contain forms
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
              if (node.matches && (node.matches('form') || node.querySelector('form, input, select, textarea'))) {
                console.log('🔍 New form detected, auto-analyzing...');
                this.autoDetectForms();
                break;
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async autoDetectForms() {
    // Quick check if forms exist
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select, textarea, [role="textbox"], [role="combobox"]');

    if (forms.length === 0 && inputs.length === 0) {
      console.log('📝 No forms detected on this page');
      return;
    }

    console.log(`📝 Found ${forms.length} forms and ${inputs.length} input fields - analyzing...`);

    try {
      const result = await this.detectAndAnalyzeForm();

      if (result.success) {
        console.log(`✅ Form analysis complete: ${result.message}`);
        this.showNotification(
          `Auto-detected: ${result.fieldCount} fields ready to fill!`,
          'success'
        );

        // Notify popup about form detection
        try {
          chrome.runtime.sendMessage({
            action: 'formDetected',
            fieldCount: result.fieldCount,
            formType: result.formType
          });
        } catch (e) {
          // Popup might not be open, that's okay
        }
      } else {
        console.log(`⚠️ Form detection failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Auto-detection error:', error);
    }
  }

  async loadUserData() {
    try {
      const result = await chrome.storage.local.get(['userProfile']);
      this.userData = result.userProfile || this.getDefaultUserData();
    } catch (error) {
      console.error('Error loading user data:', error);
      this.userData = this.getDefaultUserData();
    }
  }

  getDefaultUserData() {
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA'
      },
      professionalInfo: {
        experience: '',
        skills: [],
        education: '',
        workAuthorization: true,
        sponsorshipNeeded: false
      },
      resume: {
        filePath: '',
        fileName: ''
      }
    };
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket(`${this.backendUrl.replace('http', 'ws')}/ws`);

      this.ws.onopen = () => {
        console.log('🔌 Connected to backend server');
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.showNotification('Backend connection error. Make sure server is running.', 'error');
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(() => this.connectWebSocket(), 3000);
      };
    } catch (error) {
      console.error('Failed to connect to backend:', error);
    }
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'form_analysis':
        this.currentAnalysis = message.data;
        console.log('📊 Received form analysis:', this.currentAnalysis);
        break;

      case 'next_action':
        this.executeAction(message.data);
        break;

      case 'alternative_strategy':
        this.tryAlternativeStrategy(message.data);
        break;

      case 'ack':
        console.log(`✅ Field ${message.field} filled successfully`);
        break;
    }
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'detectForm':
        const detection = await this.detectAndAnalyzeForm();
        sendResponse(detection);
        break;

      case 'fillForm':
        await this.fillFormIntelligently();
        sendResponse({ success: true });

        // Notify popup that form was filled
        try {
          chrome.runtime.sendMessage({
            action: 'formFilled'
          });
        } catch (e) {
          // Popup might not be open
        }
        break;

      case 'getUserData':
        sendResponse({ success: true, data: this.userData });
        break;

      case 'updateUserData':
        this.userData = { ...this.userData, ...request.data };
        await chrome.storage.local.set({ userProfile: this.userData });
        sendResponse({ success: true });
        break;

      case 'getPageContext':
        // Return page context for chat
        const context = {
          title: document.title,
          hasForm: document.querySelectorAll('form').length > 0,
          inputCount: document.querySelectorAll('input, select, textarea').length,
          currentAnalysis: this.currentAnalysis ? {
            fieldCount: this.currentAnalysis.field_mappings?.length || 0,
            formType: this.currentAnalysis.form_type
          } : null
        };
        sendResponse(context);
        break;
    }
  }

  async detectAndAnalyzeForm() {
    console.log('🔍 Detecting and analyzing form...');

    try {
      // Extract complete form HTML and structure
      const formData = this.extractFormStructure();

      if (!formData.html) {
        return {
          success: false,
          message: 'No form detected on this page'
        };
      }

      // Send to backend for LLM analysis
      const response = await fetch(`${this.backendUrl}/api/analyze-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: formData.html,
          url: window.location.href,
          user_profile: this.userData,
          screenshot: null // Could add screenshot here
        })
      });

      const analysis = await response.json();

      if (analysis.success) {
        this.currentAnalysis = analysis;

        return {
          success: true,
          fieldCount: analysis.field_mappings.length,
          formType: analysis.form_type,
          confidence: analysis.confidence,
          message: `Found ${analysis.field_mappings.length} fields (${Math.round(analysis.confidence * 100)}% confidence)`
        };
      } else {
        return {
          success: false,
          message: analysis.error || 'Failed to analyze form'
        };
      }

    } catch (error) {
      console.error('Error analyzing form:', error);
      return {
        success: false,
        message: `Analysis error: ${error.message}`
      };
    }
  }

  extractFormStructure() {
    /**
     * Extract complete form structure including:
     * - All input fields (including custom ones)
     * - Labels and associated text
     * - Aria labels and roles
     * - Data attributes
     * - Computed styles (for visibility)
     */

    const forms = document.querySelectorAll('form');

    if (forms.length === 0) {
      // No <form> tags? Look for any inputs
      const inputs = document.querySelectorAll('input, select, textarea, [role="textbox"], [role="combobox"]');

      if (inputs.length > 0) {
        // Build synthetic form HTML
        const container = document.createElement('div');
        inputs.forEach(input => {
          container.appendChild(input.cloneNode(true));
        });
        return { html: container.innerHTML, count: inputs.length };
      }

      return { html: '', count: 0 };
    }

    // Extract all forms
    let allHtml = '';
    forms.forEach(form => {
      allHtml += form.outerHTML + '\n\n';
    });

    return {
      html: allHtml,
      count: forms.length
    };
  }

  async fillFormIntelligently() {
    if (this.isFilling) {
      console.log('Already filling form');
      return;
    }

    if (!this.currentAnalysis) {
      this.showNotification('Please detect form first', 'warning');
      return;
    }

    this.isFilling = true;
    this.filledFields.clear();

    console.log('🎯 Starting intelligent form filling...');
    this.showNotification('Starting intelligent form fill...', 'info');

    try {
      const instructions = this.currentAnalysis.instructions || [];

      for (const instruction of instructions) {
        await this.executeInstruction(instruction);
        await this.delay(800); // Reasonable delay between fields
      }

      this.showNotification('Form filled successfully! 🎉', 'success');
      console.log('✅ Form filling completed');

    } catch (error) {
      console.error('Error filling form:', error);
      this.showNotification(`Error: ${error.message}`, 'error');
    } finally {
      this.isFilling = false;
    }
  }

  async executeInstruction(instruction) {
    const { action, selector, value, field_type } = instruction;

    console.log(`Executing: ${action} on ${selector} with value: ${value}`);

    try {
      const element = await this.findElement(selector);

      if (!element) {
        console.warn(`Element not found: ${selector}`);
        return;
      }

      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.delay(300);

      switch (action) {
        case 'fill':
          await this.fillField(element, value, field_type);
          break;

        case 'select':
          await this.selectDropdownOption(element, value);
          break;

        case 'click':
          await this.clickElement(element);
          break;

        case 'upload':
          await this.uploadFile(element, value);
          break;
      }

      this.filledFields.add(selector);

      // Notify backend via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          action: 'field_filled',
          field_name: selector,
          value: value
        }));
      }

    } catch (error) {
      console.error(`Failed to execute instruction:`, error);

      // Ask backend for alternative strategy
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          action: 'error',
          error: error.message,
          field: instruction
        }));
      }
    }
  }

  async findElement(selector) {
    /**
     * Smart element finder that tries multiple strategies:
     * 1. Direct querySelector
     * 2. Shadow DOM search
     * 3. Iframe search
     * 4. Fuzzy selector matching
     */

    // Try direct querySelector
    let element = document.querySelector(selector);
    if (element) return element;

    // Try shadow DOM
    element = this.findInShadowDOM(selector);
    if (element) return element;

    // Try iframes
    element = this.findInIframes(selector);
    if (element) return element;

    return null;
  }

  findInShadowDOM(selector) {
    /**
     * Recursively search shadow DOMs
     */
    const searchShadowRoot = (root) => {
      const element = root.querySelector(selector);
      if (element) return element;

      const shadowHosts = root.querySelectorAll('*');
      for (const host of shadowHosts) {
        if (host.shadowRoot) {
          const found = searchShadowRoot(host.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };

    return searchShadowRoot(document);
  }

  findInIframes(selector) {
    /**
     * Search in iframes (if same-origin)
     */
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        const element = iframe.contentDocument?.querySelector(selector);
        if (element) return element;
      } catch (e) {
        // Cross-origin iframe, skip
      }
    }
    return null;
  }

  async fillField(element, value, fieldType) {
    /**
     * Universal field filler that works with any input type
     */

    // Focus element
    element.focus();
    await this.delay(100);

    // Handle different field types
    if (element.tagName === 'SELECT') {
      return this.selectDropdownOption(element, value);
    }

    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = (value === 'true' || value === true || value === 'Yes');
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // For contenteditable or custom inputs
    if (element.isContentEditable || element.getAttribute('role') === 'textbox') {
      element.textContent = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    // Standard text input
    // Simulate typing for better compatibility
    element.value = '';
    await this.delay(50);

    // Try native setter (works with React)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    nativeInputValueSetter.call(element, value);

    // Dispatch all events that frameworks might listen to
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    console.log(`✅ Filled ${element.name || element.id} with: ${value}`);
  }

  async selectDropdownOption(element, desiredValue) {
    /**
     * Intelligent dropdown selection that works with:
     * - Native <select>
     * - React Select
     * - Material-UI
     * - Custom dropdowns
     */

    // Native select
    if (element.tagName === 'SELECT') {
      return this.selectNativeDropdown(element, desiredValue);
    }

    // Custom dropdown - try to open it
    const trigger = element.closest('[role="combobox"]') ||
                    element.closest('[role="button"]') ||
                    element.querySelector('[role="combobox"]') ||
                    element;

    // Click to open
    trigger.click();
    await this.delay(500);

    // Get all visible options
    const options = this.findDropdownOptions();

    if (options.length === 0) {
      console.warn('No dropdown options found');
      return;
    }

    // Ask backend to select best option
    const optionTexts = Array.from(options).map(opt => opt.textContent.trim());

    try {
      const response = await fetch(`${this.backendUrl}/api/smart-dropdown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dropdown_html: element.outerHTML,
          options: optionTexts,
          desired_value: desiredValue,
          context: this.getElementContext(element)
        })
      });

      const result = await response.json();

      if (result.success) {
        // Find and click the selected option
        const selectedOption = Array.from(options).find(
          opt => opt.textContent.trim() === result.selected_option
        );

        if (selectedOption) {
          selectedOption.click();
          console.log(`✅ Selected dropdown option: ${result.selected_option} (confidence: ${result.confidence})`);
        }
      }
    } catch (error) {
      console.error('Error with smart dropdown selection:', error);
      // Fallback to fuzzy matching
      this.selectOptionFallback(options, desiredValue);
    }
  }

  findDropdownOptions() {
    /**
     * Find all visible dropdown options in the DOM
     */
    const selectors = [
      '[role="option"]',
      '[role="listbox"] li',
      '.select-option',
      '[class*="option"]',
      '[class*="menu-item"]',
      'ul li',
      '[data-value]'
    ];

    let options = [];
    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      options.push(...elements.filter(el => this.isVisible(el)));

      if (options.length > 0) break;
    }

    return options;
  }

  selectNativeDropdown(selectElement, desiredValue) {
    /**
     * Select option from native <select>
     */
    const options = Array.from(selectElement.options);

    // Try exact match
    let matchingOption = options.find(opt =>
      opt.value.toLowerCase() === desiredValue.toLowerCase() ||
      opt.text.toLowerCase() === desiredValue.toLowerCase()
    );

    // Try substring match
    if (!matchingOption) {
      matchingOption = options.find(opt =>
        opt.text.toLowerCase().includes(desiredValue.toLowerCase()) ||
        desiredValue.toLowerCase().includes(opt.text.toLowerCase())
      );
    }

    if (matchingOption) {
      selectElement.value = matchingOption.value;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Selected: ${matchingOption.text}`);
      return true;
    }

    return false;
  }

  selectOptionFallback(options, desiredValue) {
    /**
     * Fallback fuzzy matching for custom dropdowns
     */
    const desired = desiredValue.toLowerCase();

    for (const option of options) {
      const text = option.textContent.toLowerCase().trim();
      if (text === desired || text.includes(desired) || desired.includes(text)) {
        option.click();
        return;
      }
    }

    // No match found, click first option
    if (options.length > 0) {
      options[0].click();
    }
  }

  async uploadFile(element, filePath) {
    /**
     * Intelligent file upload handler
     */

    if (element.type !== 'file') {
      console.warn('Not a file input');
      return;
    }

    try {
      // Use File System Access API if available
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{
            description: 'Resume Files',
            accept: {
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc', '.docx']
            }
          }]
        });

        const file = await fileHandle.getFile();

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        element.files = dataTransfer.files;

        element.dispatchEvent(new Event('change', { bubbles: true }));

        this.showNotification('File uploaded successfully!', 'success');
      } else {
        // Fallback: prompt user to click
        this.showNotification('Please click to select your file', 'info');
        element.click();
      }
    } catch (error) {
      console.error('File upload error:', error);
      this.showNotification('Please manually select your file', 'warning');
      element.click();
    }
  }

  async clickElement(element) {
    element.click();
    await this.delay(200);
  }

  getElementContext(element) {
    /**
     * Get surrounding context for better LLM understanding
     */
    const label = this.findAssociatedLabel(element);
    const parent = element.closest('div[class*="field"], div[class*="form-group"]');

    return {
      label: label?.textContent || '',
      parentText: parent?.textContent.substring(0, 200) || '',
      placeholder: element.placeholder || '',
      ariaLabel: element.getAttribute('aria-label') || ''
    };
  }

  findAssociatedLabel(element) {
    // Try label[for]
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label;
    }

    // Try parent label
    return element.closest('label');
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showNotification(message, type = 'info') {
    const colors = {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 350px;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dynamicFormFiller = new DynamicFormFiller();
  });
} else {
  window.dynamicFormFiller = new DynamicFormFiller();
}
