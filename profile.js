// Profile Management Script for AI Tinkerer Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('profileForm');
  const statusElement = document.getElementById('status');
  const fileInput = document.getElementById('resumeFile');
  const fileLabel = document.getElementById('fileLabel');
  
  // Load saved profile on page load
  loadProfile();
  
  // Handle file upload
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      fileLabel.textContent = `Selected: ${file.name}`;
      fileLabel.style.background = 'rgba(76, 175, 80, 0.3)';
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    saveProfile();
  });
  
  // Load profile button
  document.getElementById('loadProfile').addEventListener('click', loadProfile);
  
  // Clear profile button
  document.getElementById('clearProfile').addEventListener('click', clearProfile);
  
  // Auto-save on input change
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('change', function() {
      // Debounce auto-save
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(saveProfile, 1000);
    });
  });
  
  function loadProfile() {
    chrome.storage.local.get(['userProfile'], function(result) {
      if (result.userProfile) {
        const profile = result.userProfile;
        
        // Load personal information
        if (profile.personalInfo) {
          document.getElementById('firstName').value = profile.personalInfo.firstName || '';
          document.getElementById('lastName').value = profile.personalInfo.lastName || '';
          document.getElementById('email').value = profile.personalInfo.email || '';
          document.getElementById('phone').value = profile.personalInfo.phone || '';
          document.getElementById('address').value = profile.personalInfo.address || '';
          document.getElementById('city').value = profile.personalInfo.city || '';
          document.getElementById('state').value = profile.personalInfo.state || '';
          document.getElementById('postalCode').value = profile.personalInfo.postalCode || '';
          document.getElementById('country').value = profile.personalInfo.country || 'USA';
          document.getElementById('age').value = profile.personalInfo.age || '';
          document.getElementById('gender').value = profile.personalInfo.gender || '';
          document.getElementById('race').value = profile.personalInfo.race || '';
          document.getElementById('veteranStatus').value = profile.personalInfo.veteranStatus || 'Not a veteran';
          document.getElementById('disabilityStatus').value = profile.personalInfo.disabilityStatus || 'No disability';
        }
        
        // Load professional information
        if (profile.professionalInfo) {
          document.getElementById('experience').value = profile.professionalInfo.experience || '';
          document.getElementById('skills').value = profile.professionalInfo.skills ? profile.professionalInfo.skills.join(', ') : '';
          document.getElementById('education').value = profile.professionalInfo.education || '';
          document.getElementById('certifications').value = profile.professionalInfo.certifications ? profile.professionalInfo.certifications.join(', ') : '';
          document.getElementById('workAuthorization').checked = profile.professionalInfo.workAuthorization || false;
          document.getElementById('sponsorshipNeeded').checked = profile.professionalInfo.sponsorshipNeeded || false;
          document.getElementById('professionalLicense').checked = profile.professionalInfo.professionalLicense || false;
        }
        
        // Load resume information
        if (profile.resume) {
          if (profile.resume.fileName) {
            fileLabel.textContent = `Resume: ${profile.resume.fileName}`;
            fileLabel.style.background = 'rgba(76, 175, 80, 0.3)';
          }
        }
        
        updateStatus('Profile loaded successfully');
      } else {
        updateStatus('No saved profile found');
      }
    });
  }
  
  function saveProfile() {
    const formData = new FormData(form);
    const profile = {
      personalInfo: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        race: formData.get('race'),
        veteranStatus: formData.get('veteranStatus'),
        disabilityStatus: formData.get('disabilityStatus')
      },
      professionalInfo: {
        experience: formData.get('experience'),
        skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s) : [],
        education: formData.get('education'),
        certifications: formData.get('certifications') ? formData.get('certifications').split(',').map(s => s.trim()).filter(s => s) : [],
        workAuthorization: formData.get('workAuthorization') === 'on',
        sponsorshipNeeded: formData.get('sponsorshipNeeded') === 'on',
        professionalLicense: formData.get('professionalLicense') === 'on'
      },
      resume: {
        fileName: fileInput.files[0] ? fileInput.files[0].name : '',
        uploadReady: fileInput.files[0] ? true : false,
        lastUpdated: new Date().toISOString()
      },
      preferences: {
        autoFill: true,
        skipOptional: false,
        confirmBeforeSubmit: true
      },
      lastUpdated: new Date().toISOString()
    };
    
    chrome.storage.local.set({ userProfile: profile }, function() {
      if (chrome.runtime.lastError) {
        updateStatus('Error saving profile: ' + chrome.runtime.lastError.message, 'error');
      } else {
        updateStatus('Profile saved successfully!');
        
        // Notify content script of profile update
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateUserData',
              data: profile
            });
          }
        });
      }
    });
  }
  
  function clearProfile() {
    if (confirm('Are you sure you want to clear all profile data? This action cannot be undone.')) {
      form.reset();
      fileLabel.textContent = 'Click to select resume file';
      fileLabel.style.background = 'rgba(255, 255, 255, 0.2)';
      
      chrome.storage.local.remove(['userProfile'], function() {
        updateStatus('Profile cleared');
      });
    }
  }
  
  function updateStatus(message, type = 'info') {
    statusElement.textContent = message;
    statusElement.style.background = type === 'error' ? 'rgba(244, 67, 54, 0.8)' : 
                                    type === 'success' ? 'rgba(76, 175, 80, 0.8)' : 
                                    'rgba(0, 0, 0, 0.2)';
    
    setTimeout(() => {
      statusElement.textContent = 'Ready to manage your profile';
      statusElement.style.background = 'rgba(0, 0, 0, 0.2)';
    }, 3000);
  }
  
  // Export profile functionality
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      exportProfile();
    }
  });
  
  function exportProfile() {
    chrome.storage.local.get(['userProfile'], function(result) {
      if (result.userProfile) {
        const dataStr = JSON.stringify(result.userProfile, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ai-tinkerer-profile.json';
        link.click();
        URL.revokeObjectURL(url);
        updateStatus('Profile exported successfully');
      }
    });
  }
  
  // Import profile functionality
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.style.display = 'none';
  document.body.appendChild(importInput);
  
  importInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedProfile = JSON.parse(e.target.result);
          chrome.storage.local.set({ userProfile: importedProfile }, function() {
            loadProfile();
            updateStatus('Profile imported successfully');
          });
        } catch (error) {
          updateStatus('Error importing profile: Invalid JSON', 'error');
        }
      };
      reader.readAsText(file);
    }
  });
  
  // Add import button
  const importButton = document.createElement('button');
  importButton.textContent = 'Import Profile';
  importButton.type = 'button';
  importButton.addEventListener('click', () => importInput.click());
  document.querySelector('.button-group').appendChild(importButton);
});
