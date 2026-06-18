"""Cliff route — benefits cliff calculation (no AI).

Mounted at /api/cliff (see main.py).

SKELETON: handler is stubbed. See CLAUDE.md "Module G → routes/cliff.py".
"""

from fastapi import APIRouter, Request

from backend.schemas import CliffRequest, CliffResponse

router = APIRouter()


@router.post("/calculate", response_model=CliffResponse)
async def calculate(request: Request, body: CliffRequest) -> CliffResponse:
    """Validate the range (max_income <= 10000, step >= 10) and run
    cliff_calculator.calculate(...). 400 (INVALID_RANGE) on bad range."""
    raise NotImplementedError("TODO: implement /api/cliff/calculate")
