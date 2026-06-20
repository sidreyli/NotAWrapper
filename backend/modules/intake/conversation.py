"""LLM intake conversation driver.

Wraps the Anthropic client to run the intake conversation. The LLM only collects
information; eligibility is never decided here. Model string is always
`claude-sonnet-4-6` (see CLAUDE.md invariant 8).
"""

import logging

import anthropic
from fastapi import HTTPException

from backend.schemas import IntakeResponse
from backend.modules.intake.session_manager import session_manager
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

    async def send_message(self, session_id: str, user_message: str) -> IntakeResponse:
        """Append the user message, call claude-sonnet-4-6, extract any completed
        profile, update the session, and return an IntakeResponse.

        On any Anthropic API error, raise HTTPException(502, "AI service unavailable").
        """
        # Ensure the session exists (create on first contact).
        try:
            session_manager.get_session(session_id)
        except KeyError:
            session = session_manager.create_session()
            session_id = session.session_id

        session_manager.add_message(session_id, "user", user_message)
        session = session_manager.get_session(session_id)

        try:
            response = self.client.messages.create(
                model=MODEL,
                max_tokens=1024,
                system=build_intake_system_prompt(),
                messages=build_intake_user_prompt(session.messages),
            )
        except anthropic.AnthropicError as exc:
            logger.error("Anthropic intake call failed: %s", exc)
            raise HTTPException(status_code=502, detail="AI service unavailable") from exc

        response_text = response.content[0].text

        is_complete, profile = extract_profile(session_id, response_text)

        if is_complete and profile is not None:
            # Surface only the conversational text before the marker to the user.
            reply = response_text.split(MARKER)[0].strip() or (
                "Thank you — I have everything I need. Let me check your eligibility now."
            )
            session_manager.add_message(session_id, "assistant", reply)
            session_manager.mark_complete(session_id, profile)
            return IntakeResponse(
                session_id=session_id, reply=reply, is_complete=True, profile=profile
            )

        session_manager.add_message(session_id, "assistant", response_text)
        return IntakeResponse(
            session_id=session_id, reply=response_text, is_complete=False, profile=None
        )
