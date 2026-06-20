"""Explain routes — LLM action plan + program-knowledge chat.

Mounted at /api/explain (see main.py).
"""

from fastapi import APIRouter, Request

from schemas import (
    ExplainRequest,
    ActionPlanResponse,
    ProgramChatRequest,
    ProgramChatResponse,
)

router = APIRouter()


@router.post("/action-plan", response_model=ActionPlanResponse)
async def action_plan(request: Request, body: ExplainRequest) -> ActionPlanResponse:
    """Call action_plan_generator.generate(profile, results) and return the plan."""
    generator = request.app.state.explainer
    # Honor the requested language by threading it onto the profile.
    profile = body.profile
    if body.language and body.language != profile.language:
        profile = profile.model_copy(update={"language": body.language})
    return await generator.generate(profile, body.results)


@router.post("/chat", response_model=ProgramChatResponse)
async def chat(request: Request, body: ProgramChatRequest) -> ProgramChatResponse:
    """Answer a follow-up question about the programs, grounded in program data and
    the user's eligibility results."""
    generator = request.app.state.explainer
    reply = await generator.chat(
        body.profile, body.results, body.language, body.history, body.message
    )
    return ProgramChatResponse(reply=reply)
