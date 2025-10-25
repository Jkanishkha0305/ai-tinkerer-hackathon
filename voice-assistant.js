/**
 * Voice Assistant for Form Filling
 * Two-way voice communication with translation support
 */

class VoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentLanguage = 'en-US';
    this.nativeLanguage = 'en'; // Will be set by user
    this.awaitingResponse = false;
    this.currentQuestion = null;
    this.onResponseCallback = null;

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Keep listening
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateUI('listening');
        console.log('🎤 Voice Assistant listening...');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateUI('idle');
        console.log('🎤 Voice Assistant stopped');

        // Restart if awaiting response
        if (this.awaitingResponse) {
          setTimeout(() => this.startListening(), 500);
        }
      };

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        console.log('📝 Heard:', transcript);

        // If we're waiting for an answer to a question
        if (this.awaitingResponse && event.results[event.results.length - 1].isFinal) {
          this.handleUserResponse(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        this.isListening = false;
        this.updateUI('error');
      };
    } else {
      console.error('Speech recognition not supported');
    }
  }

  // Speak text out loud (Text-to-Speech)
  async speak(text, lang = 'en-US') {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get available voices
      const voices = this.synthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.updateUI('speaking');
        console.log('🔊 Speaking:', text);
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.updateUI('idle');
        console.log('✅ Finished speaking');
        resolve();
      };

      utterance.onerror = (error) => {
        this.isSpeaking = false;
        this.updateUI('error');
        console.error('❌ Speech synthesis error:', error);
        reject(error);
      };

      this.synthesis.speak(utterance);
    });
  }

  // Start listening for user voice
  startListening() {
    if (!this.recognition) {
      console.error('Speech recognition not available');
      return;
    }

    if (!this.isListening) {
      this.recognition.start();
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.awaitingResponse = false;
    }
  }

  // Ask user a question and wait for response
  async askQuestion(question, fieldName, callback) {
    this.currentQuestion = fieldName;
    this.onResponseCallback = callback;
    this.awaitingResponse = true;

    // Speak the question
    await this.speak(question);

    // Start listening for answer
    this.startListening();

    // Visual indication
    this.showQuestionInUI(question);
  }

  // Handle user's voice response
  async handleUserResponse(transcript) {
    console.log(`💬 User response for "${this.currentQuestion}": ${transcript}`);

    this.awaitingResponse = false;
    this.stopListening();

    // Translate if not in English
    let translatedText = transcript;
    if (this.nativeLanguage !== 'en') {
      translatedText = await this.translateToEnglish(transcript);
      console.log(`🌐 Translated: ${transcript} → ${translatedText}`);
    }

    // Call the callback with the answer
    if (this.onResponseCallback) {
      this.onResponseCallback(this.currentQuestion, translatedText);
      this.onResponseCallback = null;
    }

    this.currentQuestion = null;
  }

  // Translate text using DeepL
  async translateToEnglish(text) {
    try {
      const response = await fetch('http://localhost:8000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          source_lang: this.nativeLanguage,
          target_lang: 'EN'
        })
      });

      const data = await response.json();

      if (data.success) {
        return data.translated_text;
      } else {
        console.error('Translation failed:', data.error);
        return text; // Return original if translation fails
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  // Set user's native language
  setNativeLanguage(langCode) {
    this.nativeLanguage = langCode;

    // Update speech recognition language
    const langMap = {
      'ES': 'es-ES',
      'FR': 'fr-FR',
      'DE': 'de-DE',
      'HI': 'hi-IN',
      'TA': 'ta-IN',
      'TE': 'te-IN',
      'KN': 'kn-IN',
      'ML': 'ml-IN',
      'ZH': 'zh-CN',
      'JA': 'ja-JP',
      'KO': 'ko-KR'
    };

    this.currentLanguage = langMap[langCode] || 'en-US';

    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }

    console.log(`🌍 Language set to: ${langCode} (${this.currentLanguage})`);
  }

  // Update UI to show current state
  updateUI(state) {
    // Send message to popup or inject visual indicator
    try {
      chrome.runtime.sendMessage({
        action: 'voiceState',
        state: state // 'listening', 'speaking', 'idle', 'error'
      });
    } catch (e) {
      // Popup might not be open
    }

    // Also update on-page indicator
    this.showStatusOnPage(state);
  }

  // Show visual status on the page itself
  showStatusOnPage(state) {
    let indicator = document.getElementById('voice-assistant-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'voice-assistant-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }

    switch (state) {
      case 'listening':
        indicator.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        indicator.innerHTML = '🎤';
        indicator.style.animation = 'pulse 1.5s infinite';
        break;
      case 'speaking':
        indicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        indicator.innerHTML = '🔊';
        indicator.style.animation = 'pulse 1.5s infinite';
        break;
      case 'idle':
        indicator.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
        indicator.innerHTML = '✓';
        indicator.style.animation = 'none';
        break;
      case 'error':
        indicator.style.background = 'linear-gradient(135deg, #f5576c 0%, #e74c3c 100%)';
        indicator.innerHTML = '⚠️';
        indicator.style.animation = 'none';
        break;
    }

    // Add pulse animation if not already added
    if (!document.getElementById('voice-assistant-styles')) {
      const style = document.createElement('style');
      style.id = 'voice-assistant-styles';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Show question in UI
  showQuestionInUI(question) {
    let questionBox = document.getElementById('voice-question-box');

    if (!questionBox) {
      questionBox = document.createElement('div');
      questionBox.id = 'voice-question-box';
      questionBox.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        color: #333;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 999998;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 16px;
        max-width: 500px;
        text-align: center;
      `;
      document.body.appendChild(questionBox);
    }

    questionBox.innerHTML = `
      <div style="font-weight: 600; color: #667eea; margin-bottom: 8px;">🤖 Assistant</div>
      <div>${question}</div>
      <div style="margin-top: 12px; font-size: 14px; color: #999;">🎤 Speak your answer...</div>
    `;
    questionBox.style.display = 'block';

    // Hide after response
    setTimeout(() => {
      if (!this.awaitingResponse) {
        questionBox.style.display = 'none';
      }
    }, 10000);
  }

  // Hide question box
  hideQuestion() {
    const questionBox = document.getElementById('voice-question-box');
    if (questionBox) {
      questionBox.style.display = 'none';
    }
  }

  // Clean up
  destroy() {
    this.stopListening();
    this.synthesis.cancel();

    // Remove UI elements
    const indicator = document.getElementById('voice-assistant-indicator');
    const questionBox = document.getElementById('voice-question-box');
    const styles = document.getElementById('voice-assistant-styles');

    if (indicator) indicator.remove();
    if (questionBox) questionBox.remove();
    if (styles) styles.remove();
  }
}

// Initialize voice assistant
window.voiceAssistant = new VoiceAssistant();

console.log('🎤 Voice Assistant initialized');
