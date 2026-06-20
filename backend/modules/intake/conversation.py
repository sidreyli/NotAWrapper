"""LLM intake conversation driver.

Wraps the Anthropic client to run the intake conversation. The LLM only collects
information; eligibility is never decided here. Model string is always
`claude-sonnet-4-6` (see CLAUDE.md invariant 8).
"""

import asyncio
import logging
import uuid

import anthropic
from fastapi import HTTPException

from backend.schemas import IntakeMessage, IntakeResponse
from backend.modules.intake.prompt_builder import (
    build_intake_system_prompt,
    build_intake_user_prompt,
)
from backend.modules.intake.profile_extractor import extract_profile, MARKER

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-6"


class IntakeConversation:
    def __init__(self, anthropic_client: anthropic.Anthropic) -> None:
        self.client = anthropic_client

    async def send_message(
        self,
        session_id: str | None,
        user_message: str,
        history: list[IntakeMessage] | None = None,
    ) -> IntakeResponse:
        """Append the user message, call claude-sonnet-4-6, extract any completed
        profile, update the session, and return an IntakeResponse.

        On any Anthropic API error, raise HTTPException(502, "AI service unavailable").
        """
        # The complete conversation is supplied by the browser so any Vercel
        # function instance can handle the next turn without process memory.
        current_session_id = session_id or str(uuid.uuid4())
        messages = list(history or [])
        messages.append(IntakeMessage(role="user", content=user_message))

        try:
            response = await asyncio.to_thread(
                self.client.messages.create,
                model=MODEL,
                max_tokens=1024,
                system=build_intake_system_prompt(),
                messages=build_intake_user_prompt(messages),
            )
        except anthropic.AnthropicError as exc:
            logger.error("Anthropic intake call failed: %s", exc)
            raise HTTPException(status_code=502, detail="AI service unavailable") from exc

        response_text = response.content[0].text

        is_complete, profile = extract_profile(current_session_id, response_text)

        if is_complete and profile is not None:
            # Surface only the conversational text before the marker to the user.
            reply = response_text.split(MARKER)[0].strip() or (
                "Thank you — I have everything I need. Let me check your eligibility now."
            )
            return IntakeResponse(
                session_id=current_session_id, reply=reply, is_complete=True, profile=profile
            )

        return IntakeResponse(
            session_id=current_session_id, reply=response_text, is_complete=False, profile=None
        )
