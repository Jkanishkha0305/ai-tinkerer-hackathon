// Content script for AI Tinkerer Chrome Extension

// AI-related keywords to detect
const AI_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
  'AI', 'ML', 'DL', 'algorithm', 'data science', 'chatbot', 'GPT', 'OpenAI',
  'Claude', 'Bard', 'ChatGPT', 'automation', 'robotics', 'computer vision',
  'natural language processing', 'NLP', 'predictive analytics', 'big data'
];

// Highlight styles
const HIGHLIGHT_STYLE = `
  .ai-tinkerer-highlight {
    background-color: #ffeb3b !important;
    padding: 2px 4px !important;
    border-radius: 3px !important;
    box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  .ai-tinkerer-highlight:hover {
    background-color: #ffc107 !important;
    transform: scale(1.02) !important;
  }
`;

// Inject highlight styles
function injectStyles() {
  if (!document.getElementById('ai-tinkerer-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-tinkerer-styles';
    style.textContent = HIGHLIGHT_STYLE;
    document.head.appendChild(style);
  }
}

// Highlight AI-related content
function highlightAIContent() {
  injectStyles();
  
  // Remove existing highlights
  document.querySelectorAll('.ai-tinkerer-highlight').forEach(el => {
    el.classList.remove('ai-tinkerer-highlight');
  });
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const textNodes = [];
  let node;
  
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  textNodes.forEach(textNode => {
    const text = textNode.textContent.toLowerCase();
    const hasAIKeywords = AI_KEYWORDS.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    if (hasAIKeywords && textNode.parentElement) {
      textNode.parentElement.classList.add('ai-tinkerer-highlight');
    }
  });
  
  console.log('AI content highlighted');
}

// Analyze page content
function analyzePage() {
  const analysis = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString(),
    aiKeywords: [],
    content: {
      headings: [],
      paragraphs: [],
      links: []
    },
    stats: {
      wordCount: 0,
      aiMentions: 0,
      readability: 'unknown'
    }
  };
  
  // Extract headings
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
    analysis.content.headings.push({
      level: heading.tagName,
      text: heading.textContent.trim()
    });
  });
  
  // Extract paragraphs
  document.querySelectorAll('p').forEach(paragraph => {
    const text = paragraph.textContent.trim();
    if (text.length > 50) {
      analysis.content.paragraphs.push(text);
    }
  });
  
  // Extract links
  document.querySelectorAll('a[href]').forEach(link => {
    analysis.content.links.push({
      text: link.textContent.trim(),
      href: link.href
    });
  });
  
  // Count AI keywords
  const allText = document.body.textContent.toLowerCase();
  AI_KEYWORDS.forEach(keyword => {
    const matches = allText.match(new RegExp(keyword.toLowerCase(), 'g'));
    if (matches) {
      analysis.aiKeywords.push({
        keyword: keyword,
        count: matches.length
      });
      analysis.stats.aiMentions += matches.length;
    }
  });
  
  // Calculate word count
  analysis.stats.wordCount = allText.split(/\s+/).length;
  
  // Store analysis
  chrome.storage.local.set({ 
    lastAnalysis: analysis,
    analysisHistory: [analysis, ...(window.aiTinkererHistory || [])].slice(0, 10)
  });
  
  window.aiTinkererHistory = [analysis, ...(window.aiTinkererHistory || [])].slice(0, 10);
  
  console.log('Page analysis completed:', analysis);
  return analysis;
}

// Extract text content
function extractText() {
  const textContent = {
    title: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    text: document.body.textContent,
    cleanText: document.body.innerText,
    wordCount: document.body.textContent.split(/\s+/).length
  };
  
  console.log('Text extracted:', textContent);
  return textContent;
}

// Auto-analyze on page load
function autoAnalyze() {
  setTimeout(() => {
    const analysis = analyzePage();
    console.log('Auto-analysis completed');
  }, 2000);
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  switch (request.action) {
    case 'highlightAI':
      highlightAIContent();
      sendResponse({ success: true });
      break;
      
    case 'analyzePage':
      const analysis = analyzePage();
      sendResponse({ success: true, analysis: analysis });
      break;
      
    case 'extractText':
      const textData = extractText();
      sendResponse({ success: true, text: textData.text });
      break;
      
    case 'autoAnalyze':
      autoAnalyze();
      sendResponse({ success: true });
      break;
      
    case 'getPageInfo':
      sendResponse({
        url: window.location.href,
        title: document.title,
        readyState: document.readyState
      });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Tinkerer content script loaded');
    injectStyles();
  });
} else {
  console.log('AI Tinkerer content script loaded');
  injectStyles();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+A for highlight
  if (event.ctrlKey && event.shiftKey && event.key === 'A') {
    event.preventDefault();
    highlightAIContent();
  }
  
  // Ctrl+Shift+E for extract
  if (event.ctrlKey && event.shiftKey && event.key === 'E') {
    event.preventDefault();
    const textData = extractText();
    console.log('Text extracted via keyboard shortcut');
  }
});

// Export functions for debugging
window.aiTinkerer = {
  highlight: highlightAIContent,
  analyze: analyzePage,
  extract: extractText
};
