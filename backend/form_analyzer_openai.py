"""
LLM-Powered Form Analysis using OpenAI directly
Intelligently analyzes any form structure and provides filling instructions
"""

import asyncio
from openai import AsyncOpenAI
from typing import Dict, List, Any, Optional
import json
import re
import os
from html.parser import HTMLParser


class FormHTMLParser(HTMLParser):
    """Parse HTML to extract form structure"""

    def __init__(self):
        super().__init__()
        self.forms = []
        self.current_form = None
        self.current_label = None
        self.field_labels = {}

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == 'form':
            self.current_form = {
                'tag': tag,
                'attrs': attrs_dict,
                'fields': []
            }

        elif tag == 'label':
            self.current_label = {
                'for': attrs_dict.get('for'),
                'text': ''
            }

        elif tag in ['input', 'select', 'textarea']:
            field = {
                'tag': tag,
                'type': attrs_dict.get('type', 'text'),
                'name': attrs_dict.get('name'),
                'id': attrs_dict.get('id'),
                'placeholder': attrs_dict.get('placeholder'),
                'required': 'required' in attrs_dict,
                'role': attrs_dict.get('role'),
                'class': attrs_dict.get('class'),
                'data_attrs': {k: v for k, v in attrs_dict.items() if k.startswith('data-')},
                'aria_label': attrs_dict.get('aria-label'),
            }

            if self.current_form:
                self.current_form['fields'].append(field)

    def handle_data(self, data):
        if self.current_label:
            self.current_label['text'] += data.strip()

    def handle_endtag(self, tag):
        if tag == 'form' and self.current_form:
            self.forms.append(self.current_form)
            self.current_form = None
        elif tag == 'label' and self.current_label:
            if self.current_label['for']:
                self.field_labels[self.current_label['for']] = self.current_label['text']
            self.current_label = None


class FormAnalyzer:
    """LLM-powered form analyzer using OpenAI directly"""

    def __init__(self):
        self.client = None

    async def initialize(self):
        """Initialize OpenAI client"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment")

        self.client = AsyncOpenAI(api_key=api_key)
        print("✅ OpenAI client initialized")

    async def analyze_form(
        self,
        html: str,
        url: str,
        user_profile: Dict[str, Any],
        screenshot: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze form structure using LLM
        Returns intelligent field mappings
        """

        # Parse HTML to extract form structure
        parser = FormHTMLParser()
        parser.feed(html)

        # Build form context for LLM
        form_context = self._build_form_context(parser, url)

        # Create LLM prompt
        prompt = self._create_analysis_prompt(form_context, user_profile)

        # Get LLM analysis
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an intelligent form filling assistant. Analyze forms and provide field mappings in JSON format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )

            # Parse LLM response
            llm_output = response.choices[0].message.content
            analysis = self._parse_llm_response(llm_output)

            return analysis

        except Exception as e:
            print(f"Error in LLM analysis: {str(e)}")
            # Fallback to basic analysis
            return self._fallback_analysis(parser, user_profile)

    def _build_form_context(self, parser: FormHTMLParser, url: str) -> str:
        """Build structured context from parsed form"""

        if not parser.forms:
            return "No forms detected in HTML"

        context = f"Form URL: {url}\n\n"

        for idx, form in enumerate(parser.forms):
            context += f"Form {idx + 1}:\n"
            context += f"Fields ({len(form['fields'])}):\n"

            for field in form['fields']:
                context += f"  - Tag: {field['tag']}\n"
                context += f"    Type: {field['type']}\n"
                if field['name']:
                    context += f"    Name: {field['name']}\n"
                if field['id']:
                    context += f"    ID: {field['id']}\n"
                if field['placeholder']:
                    context += f"    Placeholder: {field['placeholder']}\n"
                if field['aria_label']:
                    context += f"    Aria-label: {field['aria_label']}\n"
                if field['class']:
                    context += f"    Class: {field['class']}\n"
                if field['required']:
                    context += f"    Required: Yes\n"
                context += "\n"

        return context

    def _create_analysis_prompt(self, form_context: str, user_profile: Dict) -> str:
        """Create LLM prompt for form analysis"""

        # Extract user data fields
        available_data = []
        if 'personalInfo' in user_profile:
            for key, value in user_profile['personalInfo'].items():
                if value:
                    available_data.append(f"  - {key}: {value}")

        if 'professionalInfo' in user_profile:
            for key, value in user_profile['professionalInfo'].items():
                if value:
                    if isinstance(value, list):
                        available_data.append(f"  - {key}: {', '.join(map(str, value))}")
                    else:
                        available_data.append(f"  - {key}: {value}")

        available_data_str = "\n".join(available_data)

        prompt = f"""You are an intelligent form filling assistant. Analyze this form and provide field mappings.

FORM STRUCTURE:
{form_context}

AVAILABLE USER DATA:
{available_data_str}

TASK:
1. Identify each form field's purpose (e.g., "first name", "email", "phone")
2. Map each field to the appropriate user data
3. For dropdowns/selects, suggest the best matching value
4. Provide CSS selectors to locate each field
5. Indicate confidence level (0.0-1.0) for each mapping

Return your analysis as a JSON object with this structure:
{{
  "form_type": "job_application" | "registration" | "profile" | "other",
  "confidence": 0.0-1.0,
  "field_mappings": [
    {{
      "field_purpose": "first_name",
      "selector": "input[name='firstName']",
      "user_data_path": "personalInfo.firstName",
      "value": "John",
      "confidence": 0.95,
      "field_type": "text" | "select" | "radio" | "checkbox" | "file" | "textarea"
    }}
  ],
  "instructions": [
    {{
      "step": 1,
      "action": "fill" | "select" | "click" | "upload",
      "selector": "input[name='firstName']",
      "value": "John",
      "description": "Fill first name field"
    }}
  ]
}}

Provide ONLY the JSON response, no additional text."""

        return prompt

    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse LLM JSON response"""

        # Extract JSON from response (handle markdown code blocks)
        json_str = response.strip()
        if json_str.startswith('```'):
            # Remove markdown code block markers
            json_str = re.sub(r'^```(?:json)?\n', '', json_str)
            json_str = re.sub(r'\n```$', '', json_str)

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"Failed to parse LLM response: {e}")
            print(f"Response was: {response}")
            return self._create_empty_analysis()

    def _create_empty_analysis(self) -> Dict[str, Any]:
        """Create empty analysis structure"""
        return {
            "form_type": "unknown",
            "confidence": 0.0,
            "field_mappings": [],
            "instructions": []
        }

    def _fallback_analysis(self, parser: FormHTMLParser, user_profile: Dict) -> Dict[str, Any]:
        """Fallback analysis without LLM"""

        field_mappings = []
        instructions = []

        for form in parser.forms:
            for idx, field in enumerate(form['fields']):
                # Simple heuristic matching
                field_purpose = self._guess_field_purpose(field)

                if field_purpose:
                    selector = self._build_selector(field)
                    value = self._get_user_value(field_purpose, user_profile)

                    if value:
                        field_mappings.append({
                            "field_purpose": field_purpose,
                            "selector": selector,
                            "value": value,
                            "confidence": 0.6,
                            "field_type": field['type']
                        })

                        instructions.append({
                            "step": idx + 1,
                            "action": "fill",
                            "selector": selector,
                            "value": value,
                            "description": f"Fill {field_purpose}"
                        })

        return {
            "form_type": "unknown",
            "confidence": 0.6,
            "field_mappings": field_mappings,
            "instructions": instructions
        }

    def _guess_field_purpose(self, field: Dict) -> Optional[str]:
        """Simple heuristic to guess field purpose"""

        # Check all available hints
        hints = []
        if field['name']:
            hints.append(field['name'].lower())
        if field['id']:
            hints.append(field['id'].lower())
        if field['placeholder']:
            hints.append(field['placeholder'].lower())
        if field['aria_label']:
            hints.append(field['aria_label'].lower())

        hint_text = ' '.join(hints)

        # Simple keyword matching
        if any(kw in hint_text for kw in ['first', 'fname', 'firstname']):
            return 'first_name'
        elif any(kw in hint_text for kw in ['last', 'lname', 'lastname']):
            return 'last_name'
        elif 'email' in hint_text or field['type'] == 'email':
            return 'email'
        elif 'phone' in hint_text or 'tel' in hint_text or field['type'] == 'tel':
            return 'phone'
        elif 'address' in hint_text:
            return 'address'
        elif 'city' in hint_text:
            return 'city'
        elif 'state' in hint_text:
            return 'state'
        elif 'zip' in hint_text or 'postal' in hint_text:
            return 'postal_code'

        return None

    def _build_selector(self, field: Dict) -> str:
        """Build CSS selector for field"""

        if field['id']:
            return f"#{field['id']}"
        elif field['name']:
            return f"{field['tag']}[name='{field['name']}']"
        else:
            return f"{field['tag']}[type='{field['type']}']"

    def _get_user_value(self, field_purpose: str, user_profile: Dict) -> Optional[str]:
        """Get value from user profile"""

        mapping = {
            'first_name': 'personalInfo.firstName',
            'last_name': 'personalInfo.lastName',
            'email': 'personalInfo.email',
            'phone': 'personalInfo.phone',
            'address': 'personalInfo.address',
            'city': 'personalInfo.city',
            'state': 'personalInfo.state',
            'postal_code': 'personalInfo.postalCode'
        }

        path = mapping.get(field_purpose)
        if not path:
            return None

        parts = path.split('.')
        value = user_profile
        for part in parts:
            value = value.get(part, {})
            if not value:
                return None

        return str(value)

    async def select_dropdown_option(
        self,
        options: List[str],
        desired_value: str,
        context: str
    ) -> Dict[str, Any]:
        """Use LLM to select best dropdown option"""

        prompt = f"""Select the best matching option from this dropdown.

DROPDOWN CONTEXT: {context}
DESIRED VALUE: {desired_value}
AVAILABLE OPTIONS:
{chr(10).join(f"  {i+1}. {opt}" for i, opt in enumerate(options))}

Which option best matches the desired value? Consider:
- Exact matches
- Abbreviations (e.g., "USA" for "United States")
- Synonyms (e.g., "Yes" for "I am authorized")
- Common conventions

Return JSON:
{{
  "selected_option": "exact option text",
  "confidence": 0.0-1.0,
  "reasoning": "why this option was selected"
}}"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a dropdown selection assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            llm_output = response.choices[0].message.content
            result = self._parse_llm_response(llm_output)
            return result

        except Exception as e:
            print(f"Error in dropdown selection: {e}")
            # Fallback to fuzzy matching
            return self._fuzzy_match_option(options, desired_value)

    def _fuzzy_match_option(self, options: List[str], desired: str) -> Dict[str, Any]:
        """Fallback fuzzy matching for dropdown"""

        desired_lower = desired.lower()

        # Try exact match
        for opt in options:
            if opt.lower() == desired_lower:
                return {
                    "option": opt,
                    "confidence": 1.0,
                    "reasoning": "Exact match"
                }

        # Try substring match
        for opt in options:
            if desired_lower in opt.lower() or opt.lower() in desired_lower:
                return {
                    "option": opt,
                    "confidence": 0.8,
                    "reasoning": "Substring match"
                }

        # Return first option as fallback
        return {
            "option": options[0] if options else "",
            "confidence": 0.3,
            "reasoning": "No match found, using first option"
        }

    async def get_next_filling_action(
        self,
        current_state: Dict,
        filled_fields: List[str]
    ) -> Dict[str, Any]:
        """Determine next action in form filling process"""

        all_fields = current_state.get('field_mappings', [])

        for field in all_fields:
            if field['selector'] not in filled_fields:
                return {
                    "action": "fill",
                    "selector": field['selector'],
                    "value": field['value'],
                    "field_type": field.get('field_type', 'text')
                }

        return {
            "action": "complete",
            "message": "All fields filled"
        }

    async def get_alternative_strategy(
        self,
        error: str,
        field: Dict
    ) -> Dict[str, Any]:
        """Get alternative approach when filling fails"""

        prompt = f"""A form filling attempt failed with this error:

ERROR: {error}

FIELD INFO:
- Selector: {field.get('selector')}
- Type: {field.get('type')}
- Value to fill: {field.get('value')}

Suggest an alternative strategy to fill this field. Return JSON:
{{
  "alternative_selector": "different CSS selector to try",
  "alternative_action": "fill" | "click" | "keyboard" | "javascript",
  "reasoning": "why this might work better"
}}"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a form filling troubleshooter."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            llm_output = response.choices[0].message.content
            return self._parse_llm_response(llm_output)

        except Exception as e:
            return {
                "alternative_selector": field.get('selector'),
                "alternative_action": "manual",
                "reasoning": f"Could not determine alternative: {str(e)}"
            }

    async def determine_field_value(
        self,
        field_html: str,
        label_text: str,
        user_data: Dict
    ) -> Dict[str, Any]:
        """Determine what value should go in a specific field"""

        prompt = f"""Determine the appropriate value for this form field.

FIELD LABEL: {label_text}
FIELD HTML: {field_html}

USER DATA AVAILABLE:
{json.dumps(user_data, indent=2)}

What value from the user data should fill this field? Return JSON:
{{
  "value": "the value to use",
  "confidence": 0.0-1.0,
  "user_data_path": "path.to.data",
  "reasoning": "why this value was selected"
}}"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a field mapping assistant."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            llm_output = response.choices[0].message.content
            return self._parse_llm_response(llm_output)

        except Exception as e:
            return {
                "value": "",
                "confidence": 0.0,
                "reasoning": f"Error: {str(e)}"
            }
