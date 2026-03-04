"""
AI extraction service.

Sends meeting note images (or text) to Gemini Vision and gets back structured JSON.
Falls back to Groq for text-only extraction if Gemini is unavailable.
"""

import base64
import json
import re

import requests

EXTRACTION_PROMPT = """
You are helping an Indian MSME salesperson digitise their handwritten meeting notes.

Analyse the image carefully and extract every piece of information you can see.
Return ONLY a valid JSON object with these exact fields — no extra text, no markdown:

{
  "client_name": "full name of the client person",
  "company": "company or business name",
  "phone": "phone number (include country code if visible)",
  "email": "email address if visible",
  "city": "city or location if mentioned",
  "problems": "what problems, needs or requirements the client mentioned",
  "products": "which products or services were discussed or of interest",
  "budget_signal": "any budget, pricing or value discussions (e.g. 'budget around 5L', 'wants best price')",
  "objections": "any concerns, hesitations or objections the client raised",
  "action_items": [
    {
      "description": "specific task or next step",
      "assigned_to": "salesperson or client",
      "due_date": "YYYY-MM-DD if a date was mentioned, otherwise null"
    }
  ],
  "follow_up_date": "YYYY-MM-DD if a follow-up meeting was agreed, otherwise null",
  "deal_temp": "hot or warm or cold",
  "summary": "2-3 sentence plain-English summary of this meeting"
}

Guidance:
- deal_temp hot = client is very interested, likely to buy soon
- deal_temp warm = client is interested but no urgency
- deal_temp cold = just exploring, no clear intent
- If handwriting is unclear, make your best guess and note it in the summary
- For Indian names, spellings and phone numbers: be accurate
- If a field cannot be determined, use null (not empty string)
"""

TEXT_PROMPT = """
You are helping an Indian MSME salesperson structure their meeting notes.

Extract every piece of information from the notes below and return ONLY a valid JSON object
with these exact fields — no extra text, no markdown:

{
  "client_name": "full name of the client",
  "company": "company or business name",
  "phone": "phone number",
  "email": "email address",
  "city": "city or location",
  "problems": "what problems or needs the client mentioned",
  "products": "which products or services were discussed",
  "budget_signal": "any budget or pricing discussions",
  "objections": "any concerns or objections",
  "action_items": [
    {
      "description": "task or next step",
      "assigned_to": "salesperson or client",
      "due_date": "YYYY-MM-DD or null"
    }
  ],
  "follow_up_date": "YYYY-MM-DD or null",
  "deal_temp": "hot or warm or cold",
  "summary": "2-3 sentence summary of this meeting"
}

Notes:
"""


def _parse_json(text: str) -> dict:
    """Robustly parse JSON — strips markdown fences if present."""
    text = text.strip()
    # Strip ```json ... ``` fences
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"Could not parse AI response as JSON:\n{text[:500]}")


def _call_gemini(api_key: str, parts: list, model: str = "gemini-1.5-flash") -> str:
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }
    resp = requests.post(url, json=payload, timeout=45)
    resp.raise_for_status()
    return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


def _call_groq(api_key: str, prompt: str) -> str:
    """Groq text-only fallback (no vision support)."""
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "llama3-8b-8192",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def extract_from_image(image_bytes: bytes, api_key: str, mime_type: str = "image/jpeg") -> dict:
    """
    Send a meeting notes photo to Gemini Vision.
    Returns structured extraction dict.
    """
    parts = [
        {"text": EXTRACTION_PROMPT},
        {"inline_data": {"mime_type": mime_type, "data": base64.b64encode(image_bytes).decode()}},
    ]
    raw = _call_gemini(api_key, parts)
    return _parse_json(raw)


def extract_from_text(raw_text: str, gemini_key: str = "", groq_key: str = "") -> dict:
    """
    Extract from typed or transcribed text.
    Tries Gemini first, falls back to Groq.
    """
    prompt = TEXT_PROMPT + raw_text

    if gemini_key:
        try:
            raw = _call_gemini(gemini_key, [{"text": prompt}])
            return _parse_json(raw)
        except Exception:
            pass  # fall through to Groq

    if groq_key:
        raw = _call_groq(groq_key, prompt)
        return _parse_json(raw)

    raise ValueError("No AI API key available. Add a Gemini or Groq key in Settings.")
