"""Intake routes — conversational AI intake flow.

Mounted at /api/intake (see main.py).
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from backend.schemas import IntakeRequest, IntakeResponse
from backend.modules.intake.session_manager import session_manager

router = APIRouter()

_SEED_MESSAGE = "Hello, I need help finding benefits"


@router.post("/start", response_model=IntakeResponse)
async def start(request: Request) -> IntakeResponse:
    """Create a new session and return the first greeting message."""
    session = session_manager.create_session()
    intake = request.app.state.intake
    return await intake.send_message(session.session_id, _SEED_MESSAGE)


@router.post("/message", response_model=IntakeResponse)
async def message(request: Request, body: IntakeRequest):
    """Continue (or start) an intake session.

    404 (SESSION_NOT_FOUND) if session_id is provided but not found.
    """
    session_manager.cleanup_expired_sessions()

    if body.session_id is None:
        session = session_manager.create_session()
        session_id = session.session_id
    else:
        try:
            session_manager.get_session(body.session_id)
        except KeyError:
            return JSONResponse(
                status_code=404,
                content={
                    "error": "Session not found",
                    "code": "SESSION_NOT_FOUND",
                    "status": 404,
                },
            )
        session_id = body.session_id

    intake = request.app.state.intake
    return await intake.send_message(session_id, body.message)
