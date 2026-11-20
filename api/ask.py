"""ElderEase AI companion — Python serverless function (Vercel).

POST /api/ask with JSON {"question": "...", "history": [...]}.
Calls Google Gemini (gemini-3.5-flash-lite) through the
OpenAI-compatible endpoint. The Gemini key comes only from the
GEMINI_API_KEY environment variable, server-side — never from app
code, the repo, or a request body.

Responses:
  200 — {"answer": "...", "source": "live"}
  400 — question missing or shorter than 3 characters
  405 — non-POST method
  501 — no GEMINI_API_KEY configured (backend not wired yet)
  502 — Gemini endpoint did not answer
"""

import json
import os
import urllib.error
import urllib.request

GEMINI_MODEL = "gemini-3.5-flash-lite"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

SYSTEM_PROMPT = (
    "You are ElderEase, a kind daily companion for older adults. "
    "Answer in plain words and short sentences. Use large-print friendly "
    "language: simple words, one idea per sentence, no jargon. "
    "Give general information only. Never give a diagnosis, never tell "
    "someone to change a prescription, and never say you are a doctor. "
    "For any health topic, always end with: "
    "'Not medical advice. Ask your doctor or pharmacist if you are unsure.'"
)


def _response(status, payload):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }


def handler(event, context):
    """Vercel Python runtime entry point."""
    method = (event.get("httpMethod") or event.get("method") or "GET").upper()
    if method != "POST":
        return _response(405, {"error": "Method not allowed. Use POST."})

    try:
        body = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        return _response(400, {"error": "Request body must be valid JSON."})

    question = (body.get("question") or "").strip()
    if len(question) < 3:
        return _response(400, {"error": "Please ask a question of at least 3 characters."})

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return _response(
            501,
            {
                "error": (
                    "The AI companion is not connected yet. "
                    "Set GEMINI_API_KEY on the server to enable live answers."
                )
            },
        )

    history = body.get("history") or []
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if isinstance(history, list):
        for item in history[-6:]:
            if isinstance(item, dict) and item.get("question") and item.get("answer"):
                messages.append({"role": "user", "content": str(item["question"])})
                messages.append({"role": "assistant", "content": str(item["answer"])})
    messages.append({"role": "user", "content": question})

    payload = json.dumps(
        {
            "model": GEMINI_MODEL,
            "messages": messages,
            "max_tokens": 400,
            "temperature": 0.4,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        GEMINI_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer " + api_key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        return _response(
            502,
            {"error": "The AI service did not answer (status %s)." % exc.code},
        )
    except (urllib.error.URLError, TimeoutError):
        return _response(502, {"error": "The AI service could not be reached."})

    try:
        answer = data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError, AttributeError):
        return _response(502, {"error": "The AI service gave an empty answer."})
    if not answer:
        return _response(502, {"error": "The AI service gave an empty answer."})
    return _response(200, {"answer": answer, "source": "live"})


# Local test helper: `python3 api/ask.py` prints the handler contract.
if __name__ == "__main__":
    print(json.dumps(handler({"httpMethod": "GET"}, None)))
    print(json.dumps(handler({"httpMethod": "POST", "body": "{}"}, None)))
    print(json.dumps(handler({"httpMethod": "POST", "body": '{"question": "hi"}'}, None)))
    print(
        json.dumps(
            handler(
                {"httpMethod": "POST", "body": '{"question": "What should I wear today?"}'},
                None,
            )
        )
    )
