// Resume Filler Content Script for AI Tinkerer Chrome Extension

class ResumeFiller {
  constructor() {
    this.userData = null;
    this.formFields = new Map();
    this.isFilling = false;
    this.fillingProgress = 0;
    this.totalFields = 0;
    this.init();
  }

  async init() {
    // Load user data from storage
    await this.loadUserData();
    
    // Detect form fields on page load
    this.detectFormFields();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
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
        country: 'USA',
        age: '',
        gender: '',
        race: '',
        veteranStatus: 'Not a veteran',
        disabilityStatus: 'No disability'
      },
      professionalInfo: {
        experience: '',
        skills: [],
        education: '',
        certifications: [],
        workAuthorization: true,
        sponsorshipNeeded: false,
        professionalLicense: false
      },
      resume: {
        filePath: '',
        fileName: '',
        uploadReady: false
      },
      preferences: {
        autoFill: true,
        skipOptional: false,
        confirmBeforeSubmit: true
      }
    };
  }

  detectFormFields() {
    const commonFieldMappings = {
      // Personal Information - Standard patterns
      'first name': ['input[name*="first"]', 'input[id*="first"]', 'input[placeholder*="first"]', 'input[name="firstName"]', 'input[id="firstName"]'],
      'last name': ['input[name*="last"]', 'input[id*="last"]', 'input[placeholder*="last"]', 'input[name="lastName"]', 'input[id="lastName"]'],
      'email': ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]', 'input[name="email"]', 'input[id="email"]'],
      'phone': ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]', 'input[name="phone"]', 'input[id="phone"]'],
      'address': ['input[name*="address"]', 'input[id*="address"]', 'textarea[name*="address"]', 'input[name="address"]', 'textarea[name="address"]'],
      'city': ['input[name*="city"]', 'input[id*="city"]', 'input[name="city"]', 'input[id="city"]'],
      'state': ['select[name*="state"]', 'input[name*="state"]', 'input[id*="state"]', 'select[name="state"]', 'input[name="state"]'],
      'postal code': ['input[name*="zip"]', 'input[name*="postal"]', 'input[id*="zip"]', 'input[name="zipCode"]', 'input[name="zip"]'],
      'country': ['select[name*="country"]', 'input[name*="country"]', 'select[name="country"]', 'input[name="country"]'],
      'age': ['input[name*="age"]', 'input[id*="age"]', 'input[type="number"]', 'input[name="age"]', 'input[id="age"]'],
      
      // Professional Information
      'experience': ['input[name*="experience"]', 'select[name*="experience"]', 'input[id*="experience"]', 'select[name="experience"]', 'input[name="experience"]'],
      'skills': ['textarea[name*="skill"]', 'input[name*="skill"]', 'textarea[id*="skill"]', 'textarea[name="skills"]', 'input[name="skills"]'],
      'education': ['textarea[name*="education"]', 'input[name*="education"]', 'textarea[id*="education"]', 'textarea[name="education"]', 'input[name="education"]'],
      
      // Authorization Questions - SmartRecruiters specific
      'work authorization': ['input[name*="authorized"]', 'select[name*="authorized"]', 'input[id*="authorized"]', 'input[name="workAuthorization"]', 'select[name="workAuthorization"]'],
      'sponsorship': ['input[name*="sponsor"]', 'select[name*="sponsor"]', 'input[id*="sponsor"]', 'input[name="sponsorship"]', 'select[name="sponsorship"]'],
      'license': ['input[name*="license"]', 'select[name*="license"]', 'input[id*="license"]', 'input[name="license"]', 'select[name="license"]'],
      
      // Resume Upload - Multiple patterns
      'resume': ['input[type="file"]', 'input[name*="resume"]', 'input[id*="resume"]', 'input[name="resume"]', 'input[name="resumeFile"]'],
      'cv': ['input[type="file"]', 'input[name*="cv"]', 'input[id*="cv"]', 'input[name="cv"]', 'input[name="cvFile"]'],
      'upload': ['input[type="file"]', 'input[name="file"]', 'input[id="file"]'],
      
      // SmartRecruiters specific fields
      'firstName': ['input[name="firstName"]', 'input[id="firstName"]', 'input[name="first_name"]'],
      'lastName': ['input[name="lastName"]', 'input[id="lastName"]', 'input[name="last_name"]'],
      'zipCode': ['input[name="zipCode"]', 'input[name="zip"]', 'input[id="zipCode"]'],
      
      // Additional common fields
      'gender': ['select[name*="gender"]', 'input[name*="gender"]', 'select[name="gender"]', 'input[name="gender"]'],
      'race': ['select[name*="race"]', 'input[name*="race"]', 'select[name="race"]', 'input[name="race"]'],
      'veteran': ['select[name*="veteran"]', 'input[name*="veteran"]', 'select[name="veteranStatus"]', 'input[name="veteranStatus"]'],
      'disability': ['select[name*="disability"]', 'input[name*="disability"]', 'select[name="disabilityStatus"]', 'input[name="disabilityStatus"]']
    };

    this.formFields.clear();
    
    Object.entries(commonFieldMappings).forEach(([fieldName, selectors]) => {
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          if (this.isVisibleElement(element)) {
            const key = `${fieldName}_${index}`;
            this.formFields.set(key, {
              element: element,
              type: element.tagName.toLowerCase(),
              fieldName: fieldName,
              selector: selector
            });
          }
        });
      });
    });

    console.log(`Detected ${this.formFields.size} form fields`);
    return this.formFields.size;
  }

  isVisibleElement(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'detectForm':
        const fieldCount = this.detectFormFields();
        sendResponse({ success: true, fieldCount: fieldCount });
        break;
        
      case 'fillForm':
        await this.fillForm();
        sendResponse({ success: true, message: 'Form filling completed' });
        break;
        
      case 'getFormFields':
        const fields = Array.from(this.formFields.entries()).map(([key, data]) => ({
          key: key,
          fieldName: data.fieldName,
          type: data.type,
          selector: data.selector
        }));
        sendResponse({ success: true, fields: fields });
        break;
        
      case 'updateUserData':
        this.userData = { ...this.userData, ...request.data };
        await chrome.storage.local.set({ userProfile: this.userData });
        sendResponse({ success: true });
        break;
        
      case 'getUserData':
        sendResponse({ success: true, data: this.userData });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  async fillForm() {
    if (this.isFilling) {
      console.log('Form filling already in progress');
      return;
    }

    this.isFilling = true;
    this.fillingProgress = 0;
    this.totalFields = this.formFields.size;

    console.log('Starting form filling process...');
    
    try {
      // Step 1: Fill personal information
      await this.fillPersonalInfo();
      
      // Step 2: Fill professional information
      await this.fillProfessionalInfo();
      
      // Step 3: Handle authorization questions
      await this.fillAuthorizationQuestions();
      
      // Step 4: Upload resume if available
      await this.handleResumeUpload();
      
      // Step 5: Fill additional fields
      await this.fillAdditionalFields();
      
      console.log('Form filling completed successfully');
      
      // Notify user of completion
      this.showNotification('Form filled successfully!', 'success');
      
    } catch (error) {
      console.error('Error filling form:', error);
      this.showNotification('Error filling form: ' + error.message, 'error');
    } finally {
      this.isFilling = false;
    }
  }

  async fillPersonalInfo() {
    const personalFields = [
      'first name', 'last name', 'email', 'phone', 
      'address', 'city', 'state', 'postal code', 'country', 'age'
    ];

    for (const fieldName of personalFields) {
      const fieldData = this.getFieldData(fieldName);
      if (fieldData && this.userData.personalInfo[this.getFieldKey(fieldName)]) {
        await this.fillField(fieldData, this.userData.personalInfo[this.getFieldKey(fieldName)]);
        await this.delay(500); // Small delay between fields
      }
    }
  }

  async fillProfessionalInfo() {
    const professionalFields = ['experience', 'skills', 'education'];
    
    for (const fieldName of professionalFields) {
      const fieldData = this.getFieldData(fieldName);
      if (fieldData && this.userData.professionalInfo[this.getFieldKey(fieldName)]) {
        await this.fillField(fieldData, this.userData.professionalInfo[this.getFieldKey(fieldName)]);
        await this.delay(500);
      }
    }
  }

  async fillAuthorizationQuestions() {
    // Work authorization
    const authField = this.getFieldData('work authorization');
    if (authField) {
      const value = this.userData.professionalInfo.workAuthorization ? 'Yes' : 'No';
      await this.selectOption(authField, value);
    }

    // Sponsorship needed
    const sponsorField = this.getFieldData('sponsorship');
    if (sponsorField) {
      const value = this.userData.professionalInfo.sponsorshipNeeded ? 'Yes' : 'No';
      await this.selectOption(sponsorField, value);
    }

    // Professional license
    const licenseField = this.getFieldData('license');
    if (licenseField) {
      const value = this.userData.professionalInfo.professionalLicense ? 'Yes' : 'No';
      await this.selectOption(licenseField, value);
    }
  }

  async handleResumeUpload() {
    const resumeField = this.getFieldData('resume') || this.getFieldData('cv') || this.getFieldData('upload');
    if (resumeField && this.userData.resume.uploadReady) {
      // Note: File upload in content scripts is limited by browser security
      // This would typically require user interaction or a different approach
      console.log('Resume upload field detected, but file upload requires user interaction');
      this.showNotification('Please manually upload your resume file', 'info');
    }
  }

  async fillAdditionalFields() {
    // Fill any remaining text fields that might contain additional information
    const additionalFields = ['gender', 'race', 'veteran status', 'disability status'];
    
    for (const fieldName of additionalFields) {
      const fieldData = this.getFieldData(fieldName);
      if (fieldData && this.userData.personalInfo[this.getFieldKey(fieldName)]) {
        await this.selectOption(fieldData, this.userData.personalInfo[this.getFieldKey(fieldName)]);
        await this.delay(500);
      }
    }
  }

  getFieldData(fieldName) {
    for (const [key, data] of this.formFields.entries()) {
      if (data.fieldName === fieldName) {
        return data;
      }
    }
    return null;
  }

  getFieldKey(fieldName) {
    return fieldName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
  }

  async fillField(fieldData, value) {
    if (!fieldData || !value) return;

    const element = fieldData.element;
    
    try {
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.delay(300);

      // Focus the element
      element.focus();
      await this.delay(100);

      if (element.tagName.toLowerCase() === 'select') {
        await this.selectOption(fieldData, value);
      } else {
        // Clear existing value
        element.value = '';
        await this.delay(100);
        
        // Set new value
        element.value = value;
        
        // Trigger change event
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }

      this.fillingProgress++;
      console.log(`Filled ${fieldData.fieldName}: ${value}`);
      
    } catch (error) {
      console.error(`Error filling field ${fieldData.fieldName}:`, error);
    }
  }

  async selectOption(fieldData, value) {
    const element = fieldData.element;
    
    if (element.tagName.toLowerCase() === 'select') {
      // Handle select dropdown
      const options = Array.from(element.options);
      const matchingOption = options.find(option => 
        option.text.toLowerCase().includes(value.toLowerCase()) ||
        option.value.toLowerCase().includes(value.toLowerCase())
      );
      
      if (matchingOption) {
        element.value = matchingOption.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      // Handle radio buttons or checkboxes
      const radioButtons = document.querySelectorAll(`input[name="${element.name}"]`);
      for (const radio of radioButtons) {
        if (radio.value.toLowerCase().includes(value.toLowerCase()) ||
            radio.nextSibling?.textContent?.toLowerCase().includes(value.toLowerCase())) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Initialize resume filler when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.resumeFiller = new ResumeFiller();
  });
} else {
  window.resumeFiller = new ResumeFiller();
}
