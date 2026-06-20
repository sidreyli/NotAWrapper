"""Eligibility route — runs the deterministic rules engine.

Mounted at /api/eligibility (see main.py).
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from backend.schemas import UserProfile, EligibilityResponse
from backend.modules.data_layer.program_registry import program_registry

router = APIRouter()


@router.post("/check", response_model=EligibilityResponse)
async def check(request: Request, profile: UserProfile):
    """Validate the state is supported, run eligibility_engine.check_all(profile),
    and return an EligibilityResponse. 400 (UNSUPPORTED_STATE) if state not in
    [CA, TX, NY, FL, IL]."""
    if not program_registry.is_state_supported(profile.state):
        supported = ", ".join(program_registry.get_supported_states())
        return JSONResponse(
            status_code=400,
            content={
                "error": f"{profile.state} is not currently supported. "
                f"Supported states: {supported}.",
                "code": "UNSUPPORTED_STATE",
                "status": 400,
            },
        )

    engine = request.app.state.engine
    results = engine.check_all(profile)
    return EligibilityResponse(results=results, checked_at=datetime.now(timezone.utc))
