"""
DeepL Translation Integration
"""

import os
import aiohttp
from typing import Optional

class DeepLTranslator:
    """DeepL API translator"""

    def __init__(self):
        self.api_key = os.getenv('DEEPL_API_KEY')
        self.api_url = "https://api-free.deepl.com/v2/translate"  # Use api.deepl.com for pro

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "EN"
    ) -> Optional[str]:
        """
        Translate text using DeepL API

        Args:
            text: Text to translate
            source_lang: Source language code (e.g., 'HI', 'TA', 'ES')
            target_lang: Target language code (default: 'EN')

        Returns:
            Translated text or None if error
        """

        if not self.api_key:
            print("⚠️ DEEPL_API_KEY not found in environment")
            return text  # Return original if no API key

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    data={
                        'auth_key': self.api_key,
                        'text': text,
                        'source_lang': source_lang.upper(),
                        'target_lang': target_lang.upper()
                    }
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        translated = data['translations'][0]['text']
                        print(f"🌐 Translated: {text} ({source_lang}) → {translated} ({target_lang})")
                        return translated
                    else:
                        error_text = await response.text()
                        print(f"❌ DeepL API error {response.status}: {error_text}")
                        return text

        except Exception as e:
            print(f"❌ Translation error: {str(e)}")
            return text  # Return original on error

    async def detect_language(self, text: str) -> Optional[str]:
        """Detect language of text (not available in free tier)"""
        # DeepL auto-detects when source_lang is not provided
        return None
