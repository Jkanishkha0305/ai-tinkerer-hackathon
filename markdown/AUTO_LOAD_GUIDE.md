# 🚀 Auto-Load Extension Guide

## Option 1: Load as Unpacked Extension (Best for Development)

### **One-Time Setup:**
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your project folder: `/Users/j_kanishkha/ai-tinkerer-hackathon`
5. **The extension will stay loaded permanently!**

### **Benefits:**
- ✅ Extension stays loaded until you remove it
- ✅ Auto-reloads when you make changes
- ✅ No need to re-upload files
- ✅ Perfect for development and testing

### **To Update the Extension:**
- Just click the "Reload" button on the extension card
- Or make changes to files and it auto-reloads

---

## Option 2: Create a Chrome Extension Package

### **Step 1: Create Extension Package**
```bash
# Navigate to your project folder
cd /Users/j_kanishkha/ai-tinkerer-hackathon

# Create a ZIP file of the extension
zip -r ai-tinkerer-extension.zip . -x "*.git*" "browser-use/*" "mcp-server-example-python/*" "*.DS_Store"
```

### **Step 2: Load the Package**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select the ZIP file
4. Or drag the ZIP file directly to the extensions page

---

## Option 3: Chrome Web Store (For Distribution)

### **Step 1: Prepare for Store**
1. Create a developer account at Chrome Web Store
2. Pay the one-time $5 registration fee
3. Upload your extension files
4. Submit for review

### **Step 2: Install from Store**
1. Search for your extension in Chrome Web Store
2. Click "Add to Chrome"
3. Extension installs automatically

---

## Option 4: Auto-Install Script (Advanced)

### **Create an Installation Script:**
```bash
#!/bin/bash
# auto-install-extension.sh

echo "🚀 Auto-installing AI Tinkerer Extension..."

# Check if Chrome is running
if pgrep -x "Google Chrome" > /dev/null; then
    echo "⚠️  Please close Chrome first, then run this script"
    exit 1
fi

# Create extension package
echo "📦 Creating extension package..."
cd /Users/j_kanishkha/ai-tinkerer-hackathon
zip -r ai-tinkerer-extension.zip . -x "*.git*" "browser-use/*" "mcp-server-example-python/*" "*.DS_Store"

echo "✅ Extension package created: ai-tinkerer-extension.zip"
echo "📋 Next steps:"
echo "1. Open Chrome → chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' → Select this folder"
echo "4. Or drag the ZIP file to the extensions page"
```

---

## Option 5: Development Server (For Live Updates)

### **Create a Development Server:**
```bash
#!/bin/bash
# dev-server.sh

echo "🔄 Starting development server for AI Tinkerer Extension..."

# Watch for file changes and auto-reload
while true; do
    echo "👀 Watching for changes..."
    
    # Wait for any file changes
    inotifywait -r -e modify,create,delete /Users/j_kanishkha/ai-tinkerer-hackathon/ --exclude '\.git'
    
    echo "🔄 Files changed, reloading extension..."
    
    # Notify Chrome to reload the extension
    # (This requires a Chrome extension API)
    
    sleep 2
done
```

---

## 🎯 **Recommended Approach**

### **For Development:**
Use **Option 1** (Load as Unpacked) - it's the easiest and most reliable.

### **For Distribution:**
Use **Option 3** (Chrome Web Store) - professional and user-friendly.

### **For Team Use:**
Use **Option 2** (Package) - share the ZIP file with your team.

---

## 🔧 **Troubleshooting**

### **Extension Not Loading:**
1. Check that all required files are present
2. Verify manifest.json is valid
3. Check browser console for errors
4. Try reloading the extension

### **Auto-Reload Not Working:**
1. Make sure you're using "Load unpacked"
2. Check that files are being saved
3. Try manual reload
4. Restart Chrome if needed

### **Permission Issues:**
1. Check manifest.json permissions
2. Verify extension has required access
3. Try reloading the extension
4. Check Chrome security settings

---

## 📋 **Quick Setup Checklist**

- [ ] Chrome browser installed
- [ ] Developer mode enabled
- [ ] Project folder accessible
- [ ] All extension files present
- [ ] Manifest.json valid
- [ ] Extension loads without errors
- [ ] Test form works
- [ ] Profile management works

---

**Ready to auto-load your extension? Follow Option 1 for the easiest setup!** 🚀
