from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.core.config import GEMINI_API_KEY
from app.ai.tools import make_tools

client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = (
    "You are PocketPilot AI's financial assistant, helping a student manage their "
    "money. You have tools to look up the user's real expenses, income, and budget "
    "status — use them whenever a question depends on their actual numbers rather "
    "than guessing. Be concise, encouraging, and practical. Never invent figures. "
    "Reply in plain, conversational text only — no Markdown. Do not use asterisks, "
    "underscores, pound signs, bullet characters, or any other formatting symbols. "
    "If you need to list a few items, write them as a short sentence or use simple "
    "line breaks with plain numbers like '1)' instead of headers or bold text."
)


def run_chat(messages: list[dict], db: Session, user_id: int) -> str:
    contents = [
        types.Content(
            role="model" if m["role"] == "assistant" else "user",
            parts=[types.Part(text=m["content"])],
        )
        for m in messages
    ]

    tools = make_tools(db, user_id)

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=tools,
        ),
    )

    return response.text