# 📝 Resume Filler Chrome Extension

An intelligent Chrome extension that automatically fills job application forms using your saved profile information. Built with inspiration from browser-use automation patterns.

## 🚀 Features

### **Smart Form Detection**
- Automatically detects form fields on any job application page
- Maps common field types (name, email, phone, address, etc.)
- Supports various form layouts and field naming conventions

### **Intelligent Form Filling**
- Fills personal information (name, email, phone, address)
- Handles professional information (experience, skills, education)
- Manages work authorization questions
- Supports dropdown selections and radio buttons
- Handles file uploads (with user interaction)

### **Profile Management**
- Comprehensive profile creation and editing
- Secure local storage of personal information
- Export/import profile functionality
- Auto-save capabilities

### **User-Friendly Interface**
- Beautiful gradient design
- Intuitive popup interface
- Dedicated profile management page
- Real-time status updates

## 📋 How It Works

### **1. Profile Setup**
1. Click the extension icon
2. Click "Manage Profile" to open the profile page
3. Fill in your personal and professional information
4. Upload your resume file
5. Save your profile

### **2. Form Detection**
1. Navigate to any job application page
2. Click "Detect Form Fields" in the extension popup
3. The extension will scan the page and identify form fields
4. You'll see how many fields were detected

### **3. Auto-Fill Process**
1. Click "Auto-Fill Form" in the extension popup
2. The extension will automatically fill detected fields
3. You'll see progress notifications
4. Review and submit the form manually

## 🛠️ Technical Implementation

### **Form Field Detection**
The extension uses intelligent selectors to detect common form fields:

```javascript
const commonFieldMappings = {
  'first name': ['input[name*="first"]', 'input[id*="first"]', 'input[placeholder*="first"]'],
  'email': ['input[type="email"]', 'input[name*="email"]', 'input[id*="email"]'],
  'phone': ['input[type="tel"]', 'input[name*="phone"]', 'input[id*="phone"]'],
  // ... more mappings
};
```

### **Form Filling Logic**
Based on the browser-use pattern, the extension:

1. **Detects form fields** using multiple selector strategies
2. **Maps fields** to user profile data
3. **Fills fields sequentially** with appropriate delays
4. **Handles different input types** (text, select, radio, checkbox)
5. **Provides user feedback** throughout the process

### **Data Structure**
User profile data is structured as:

```javascript
{
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "555-555-5555",
    address: "123 Main St",
    city: "Rochester",
    state: "NY",
    postalCode: "12345",
    country: "USA",
    age: "25",
    gender: "Male",
    race: "Asian",
    veteranStatus: "Not a veteran",
    disabilityStatus: "No disability"
  },
  professionalInfo: {
    experience: "2-3 years",
    skills: ["JavaScript", "Python", "React"],
    education: "BS Computer Science, University of Rochester",
    certifications: ["AWS Certified", "PMP"],
    workAuthorization: true,
    sponsorshipNeeded: false,
    professionalLicense: false
  },
  resume: {
    fileName: "john_doe_resume.pdf",
    uploadReady: true
  }
}
```

## 🎯 Supported Form Types

### **Personal Information Fields**
- First Name, Last Name
- Email Address
- Phone Number
- Address, City, State, Postal Code, Country
- Age, Gender, Race
- Veteran Status, Disability Status

### **Professional Information Fields**
- Years of Experience
- Skills and Certifications
- Education Background
- Work Authorization Status
- Sponsorship Requirements
- Professional Licenses

### **File Upload Fields**
- Resume/CV upload
- Cover letter upload
- Portfolio upload

## 🔧 Installation & Setup

### **1. Load the Extension**
```bash
# Navigate to chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked" and select the extension folder
```

### **2. Create Your Profile**
1. Click the extension icon
2. Click "Manage Profile"
3. Fill in all your information
4. Upload your resume
5. Save your profile

### **3. Use on Job Applications**
1. Go to any job application page
2. Click "Detect Form Fields" to scan the page
3. Click "Auto-Fill Form" to fill the form
4. Review and submit manually

## 🚨 Important Notes

### **Security & Privacy**
- All data is stored locally in your browser
- No data is sent to external servers
- You control all your personal information
- Data can be exported/imported as needed

### **Limitations**
- File uploads require manual user interaction (browser security)
- Some complex forms may need manual review
- Custom form layouts might need field mapping adjustments

### **Best Practices**
- Always review filled forms before submitting
- Keep your profile information up-to-date
- Test the extension on a few applications first
- Use the "Detect Form Fields" feature to understand what will be filled

## 🔄 Workflow Example

### **Step 1: Profile Setup**
```
1. Open extension popup
2. Click "Manage Profile"
3. Fill in personal information:
   - Name: John Doe
   - Email: john@example.com
   - Phone: 555-555-5555
   - Address: 123 Main St, Rochester, NY 12345
4. Add professional information:
   - Experience: 2-3 years
   - Skills: JavaScript, Python, React
   - Education: BS Computer Science
5. Upload resume file
6. Save profile
```

### **Step 2: Job Application**
```
1. Navigate to job application page
2. Click extension icon
3. Click "Detect Form Fields" → "Detected 15 form fields!"
4. Click "Auto-Fill Form" → "Starting form fill..."
5. Watch as fields are automatically filled
6. Review the completed form
7. Submit the application
```

## 🎨 Customization

### **Adding New Field Mappings**
Edit `resume-filler.js` to add new field detection patterns:

```javascript
const commonFieldMappings = {
  'custom_field': ['input[name*="custom"]', 'input[id*="custom"]'],
  // Add your custom mappings here
};
```

### **Modifying Form Filling Logic**
Update the `fillForm()` method to customize the filling process:

```javascript
async fillForm() {
  // Add your custom logic here
  await this.fillPersonalInfo();
  await this.fillCustomFields(); // Your custom method
  // ... rest of the process
}
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Fields not detected**
   - Try refreshing the page
   - Check if the form is fully loaded
   - Some forms load dynamically

2. **Fields not filled**
   - Verify your profile is complete
   - Check if field names match expected patterns
   - Some fields might be read-only

3. **File upload not working**
   - File uploads require manual user interaction
   - Click the file upload field manually
   - Select your resume file

### **Debug Mode**
Open browser console to see detailed logging:
```javascript
// Check if extension is loaded
console.log(window.resumeFiller);

// Check detected fields
window.resumeFiller.formFields;

// Check user data
window.resumeFiller.userData;
```

## 🚀 Future Enhancements

- **AI-powered field mapping** for unknown form layouts
- **Multi-language support** for international applications
- **Template system** for different job types
- **Integration with job boards** (LinkedIn, Indeed, etc.)
- **Resume parsing** to auto-extract information
- **Cover letter generation** based on job descriptions

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Job Hunting!** 🎯✨
