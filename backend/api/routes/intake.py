"""Intake routes — conversational AI intake flow.

Mounted at /api/intake (see main.py).
"""

from fastapi import APIRouter, Request
from backend.schemas import IntakeRequest, IntakeResponse

router = APIRouter()

_SEED_MESSAGE = "Hello, I need help finding benefits"


@router.post("/start", response_model=IntakeResponse)
async def start(request: Request) -> IntakeResponse:
    """Start a stateless intake and return the first greeting message."""
    intake = request.app.state.intake
    return await intake.send_message(None, _SEED_MESSAGE, [])


@router.post("/message", response_model=IntakeResponse)
async def message(request: Request, body: IntakeRequest):
    """Continue intake using browser-supplied history; no server session is stored."""
    intake = request.app.state.intake
    return await intake.send_message(body.session_id, body.message, body.history)
