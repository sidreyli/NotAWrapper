"""Eligibility route — runs the deterministic rules engine.

Mounted at /api/eligibility (see main.py).

SKELETON: handler is stubbed. See CLAUDE.md "Module G → routes/eligibility.py".
"""

from fastapi import APIRouter, Request

from backend.schemas import UserProfile, EligibilityResponse

router = APIRouter()


@router.post("/check", response_model=EligibilityResponse)
async def check(request: Request, profile: UserProfile) -> EligibilityResponse:
    """Validate the state is supported, run eligibility_engine.check_all(profile),
    and return an EligibilityResponse. 400 (UNSUPPORTED_STATE) if state not in
    [CA, TX, NY, FL, IL]."""
    raise NotImplementedError("TODO: implement /api/eligibility/check")
