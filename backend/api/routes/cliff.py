"""Cliff route — benefits cliff calculation (no AI).

Mounted at /api/cliff (see main.py).
"""

from fastapi import APIRouter, HTTPException, Request

from modules.cliff.calculator import cliff_calculator
from schemas import CliffRequest, CliffResponse

router = APIRouter()


@router.post("/calculate", response_model=CliffResponse)
async def calculate(request: Request, body: CliffRequest) -> CliffResponse:
    if body.max_income > 10000:
        raise HTTPException(
            status_code=400,
            detail={"error": "max_income cannot exceed 10000", "code": "INVALID_RANGE", "status": 400},
        )
    if body.step < 10:
        raise HTTPException(
            status_code=400,
            detail={"error": "step must be at least 10", "code": "INVALID_RANGE", "status": 400},
        )
    return cliff_calculator.calculate(body.profile, body.min_income, body.max_income, body.step)
