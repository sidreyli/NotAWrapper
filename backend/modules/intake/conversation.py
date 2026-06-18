"""LLM intake conversation driver.

Wraps the Anthropic client to run the intake conversation. The LLM only collects
information; eligibility is never decided here. Model string is always
`claude-sonnet-4-6` (see CLAUDE.md invariant 8).

SKELETON: send_message is not yet implemented. See CLAUDE.md Module C for the
full request/extraction/session flow.
"""

import anthropic

from backend.schemas import IntakeResponse


class IntakeConversation:
    def __init__(self, anthropic_client: anthropic.Anthropic) -> None:
        self.client = anthropic_client

    async def send_message(self, session_id: str, user_message: str) -> IntakeResponse:
        """Append the user message, call claude-sonnet-4-6, extract any completed
        profile, update the session, and return an IntakeResponse.

        On any Anthropic API error, raise HTTPException(502, "AI service unavailable").
        """
        raise NotImplementedError("TODO: implement intake conversation turn")
