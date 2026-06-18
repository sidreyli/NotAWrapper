"""LLM action plan generator.

Turns deterministic eligibility results into a human-readable, multilingual action
plan. The LLM never changes eligibility outcomes. Model string is always
`claude-sonnet-4-6` (see CLAUDE.md invariant 8).

SKELETON: generate is not yet implemented. See CLAUDE.md Module D for the full flow.
"""

import anthropic

from backend.schemas import UserProfile, EligibilityResult, ActionPlanResponse


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
        raise NotImplementedError("TODO: implement action plan generation")
