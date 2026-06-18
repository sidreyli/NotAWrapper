"""Intake routes — conversational AI intake flow.

Mounted at /api/intake (see main.py).

SKELETON: handlers are stubbed. See CLAUDE.md "Module G → routes/intake.py".
"""

from fastapi import APIRouter, Request

from backend.schemas import IntakeRequest, IntakeResponse

router = APIRouter()


@router.post("/start", response_model=IntakeResponse)
async def start(request: Request) -> IntakeResponse:
    """Create a new session and return the first greeting message.

    Calls intake_conversation.send_message(new_session_id,
    "Hello, I need help finding benefits").
    """
    raise NotImplementedError("TODO: implement /api/intake/start")


@router.post("/message", response_model=IntakeResponse)
async def message(request: Request, body: IntakeRequest) -> IntakeResponse:
    """Continue (or start) an intake session.

    404 (SESSION_NOT_FOUND) if session_id is provided but not found.
    """
    raise NotImplementedError("TODO: implement /api/intake/message")
