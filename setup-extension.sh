#!/bin/bash

echo "🚀 AI Tinkerer Extension Setup Script"
echo "=================================="

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null && ! command -v chrome &> /dev/null; then
    echo "❌ Chrome browser not found. Please install Chrome first."
    exit 1
fi

echo "✅ Chrome browser found"

# Check if project folder exists
if [ ! -d "/Users/j_kanishkha/ai-tinkerer-hackathon" ]; then
    echo "❌ Project folder not found. Please check the path."
    exit 1
fi

echo "✅ Project folder found"

# Check if manifest.json exists
if [ ! -f "/Users/j_kanishkha/ai-tinkerer-hackathon/manifest.json" ]; then
    echo "❌ manifest.json not found. Please check the project structure."
    exit 1
fi

echo "✅ Extension files found"

# Create extension package
echo "📦 Creating extension package..."
cd /Users/j_kanishkha/ai-tinkerer-hackathon
zip -r ai-tinkerer-extension.zip . -x "*.git*" "browser-use/*" "mcp-server-example-python/*" "*.DS_Store" "setup-extension.sh" "AUTO_LOAD_GUIDE.md"

echo "✅ Extension package created: ai-tinkerer-extension.zip"

echo ""
echo "🎯 Next Steps:"
echo "1. Open Chrome"
echo "2. Go to chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this folder: /Users/j_kanishkha/ai-tinkerer-hackathon"
echo "6. The extension will stay loaded permanently!"
echo ""
echo "🔄 To update the extension:"
echo "- Just click the 'Reload' button on the extension card"
echo "- Or make changes to files and it auto-reloads"
echo ""
echo "🧪 To test the extension:"
echo "- Open test-form.html or smartrecruiters-test.html"
echo "- Click the extension icon"
echo "- Try 'Detect Form Fields' and 'Auto-Fill Form'"
echo ""
echo "✅ Setup complete! Your extension is ready to use."
