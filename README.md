# 🤖 AI Tinkerer Chrome Extension

A powerful Chrome extension for AI experimentation and content analysis. This extension helps you identify, highlight, and analyze AI-related content on web pages.

## Features

- **AI Content Highlighting**: Automatically highlights AI-related keywords and content
- **Page Analysis**: Analyzes web pages for AI content and provides insights
- **Text Extraction**: Extract and process text content from any webpage
- **Customizable Settings**: Configure highlighting colors, keywords, and AI providers
- **Keyboard Shortcuts**: Quick access to features via keyboard shortcuts
- **Context Menu Integration**: Right-click menu for easy access to features

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Generate Icons** (if needed):
   - Open `icon-generator.html` in your browser
   - Save the generated icons to the `icons/` folder
   - Or create your own 16x16, 32x32, 48x48, and 128x128 pixel icons

2. **Load the Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select this folder
   - The extension should now appear in your extensions list

3. **Pin the Extension**:
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "AI Tinkerer Extension" and click the pin icon

### Method 2: Package for Distribution

1. Create a ZIP file of all the extension files
2. Upload to Chrome Web Store (requires developer account)
3. Or distribute the ZIP file for manual installation

## Usage

### Basic Usage

1. **Highlight AI Content**: Click the extension icon and select "Highlight AI Content"
2. **Analyze Page**: Use the "Analyze Page" button to get insights about AI content
3. **Extract Text**: Click "Extract Text" to get all text content from the current page

### Keyboard Shortcuts

- `Ctrl+Shift+A`: Highlight AI content on the page
- `Ctrl+Shift+E`: Extract text from the page

### Context Menu

Right-click on any page to access:
- 🤖 Highlight AI Content
- 🔍 Analyze with AI
- 📝 Extract Text

### Settings

Click "Open Settings" in the popup to configure:
- Extension mode (Basic/Advanced)
- Highlight colors and opacity
- Custom AI keywords
- AI provider settings
- Data collection preferences

## File Structure

```
ai-tinkerer-hackathon/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script for page interaction
├── settings.html          # Settings page
├── settings.js            # Settings functionality
├── icon-generator.html    # Tool to generate extension icons
├── icons/                 # Extension icons folder
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Development

### Prerequisites

- Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- Chrome Developer Tools

### Making Changes

1. Edit the relevant files (HTML, CSS, JS)
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test your changes

### Debugging

- Use Chrome DevTools to debug popup and content scripts
- Check the Extensions page for error messages
- Use `console.log()` statements for debugging

## AI Integration

The extension is designed to work with various AI providers:

- **OpenAI**: GPT-3.5, GPT-4
- **Claude**: Claude 3 models
- **Local Models**: For offline processing

To integrate with AI services:

1. Add your API key in the settings
2. Modify the `processAIRequest` function in `background.js`
3. Update the AI processing logic as needed

## Customization

### Adding Custom Keywords

1. Open the extension settings
2. Add your custom AI keywords in the "Custom AI Keywords" field
3. Keywords should be comma-separated

### Styling

- Modify the CSS in `popup.html` for popup styling
- Update `content.js` for page interaction styling
- Customize the highlight colors and effects

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check that all files are present and manifest.json is valid
2. **Icons not showing**: Ensure icon files exist in the `icons/` folder
3. **Content script not working**: Check browser console for errors
4. **Settings not saving**: Verify storage permissions in manifest.json

### Debug Steps

1. Check Chrome's extension error page
2. Use Chrome DevTools to inspect the extension
3. Verify all file paths are correct
4. Check that the manifest version is 3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Chrome extension documentation
3. Open an issue in the repository

---

**Happy AI Tinkering!** 🤖✨