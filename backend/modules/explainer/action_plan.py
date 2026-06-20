"""LLM action plan generator + program-knowledge chat.

Turns deterministic eligibility results into a human-readable, multilingual action
plan, and answers follow-up questions about the programs. The LLM never changes
eligibility outcomes. Model string is always `claude-sonnet-4-6` (CLAUDE.md
invariant 8).
"""

import logging
from datetime import datetime, timezone

import anthropic
from fastapi import HTTPException

from schemas import (
    UserProfile,
    EligibilityResult,
    ActionPlanResponse,
    IntakeMessage,
)
from modules.explainer.prompt_builder import (
    build_explainer_prompt,
    build_program_chat_prompt,
)

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-6"


class ActionPlanGenerator:
    def __init__(self, anthropic_client: anthropic.Anthropic) -> None:
        self.client = anthropic_client

    async def generate(
        self, profile: UserProfile, results: list[EligibilityResult]
    ) -> ActionPlanResponse:
        """Build the explainer prompt, call claude-sonnet-4-6 (max_tokens=2000,
        single user message), and return an ActionPlanResponse.

        On any Anthropic API error, raise HTTPException(502, "AI service unavailable").
        """
        prompt = build_explainer_prompt(profile, results, profile.language)
        try:
            response = self.client.messages.create(
                model=MODEL,
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )
        except anthropic.AnthropicError as exc:
            logger.error("Anthropic explainer call failed: %s", exc)
            raise HTTPException(status_code=502, detail="AI service unavailable") from exc

        return ActionPlanResponse(
            action_plan_text=response.content[0].text,
            profile=profile,
            results=results,
            generated_at=datetime.now(timezone.utc),
        )

    async def chat(
        self,
        profile: UserProfile,
        results: list[EligibilityResult],
        language: str,
        history: list[IntakeMessage],
        message: str,
    ) -> str:
        """Answer a follow-up question about the programs, grounded in the program
        registry data and the user's results. Never re-decides eligibility.

        On any Anthropic API error, raise HTTPException(502, "AI service unavailable").
        """
        system = build_program_chat_prompt(profile, results, language)
        messages = [{"role": m.role, "content": m.content} for m in history]
        messages.append({"role": "user", "content": message})

        try:
            response = self.client.messages.create(
                model=MODEL,
                max_tokens=1024,
                system=system,
                messages=messages,
            )
        except anthropic.AnthropicError as exc:
            logger.error("Anthropic program-chat call failed: %s", exc)
            raise HTTPException(status_code=502, detail="AI service unavailable") from exc

        return response.content[0].text
