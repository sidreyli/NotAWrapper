"""Explain route — generates the LLM action plan.

Mounted at /api/explain (see main.py).

SKELETON: handler is stubbed. See CLAUDE.md "Module G → routes/explain.py".
"""

from fastapi import APIRouter, Request

from backend.schemas import ExplainRequest, ActionPlanResponse

router = APIRouter()


@router.post("/action-plan", response_model=ActionPlanResponse)
async def action_plan(request: Request, body: ExplainRequest) -> ActionPlanResponse:
    """Call action_plan_generator.generate(profile, results) and return the plan."""
    raise NotImplementedError("TODO: implement /api/explain/action-plan")
