"""CORS and global error handling for the FastAPI app.

CORS is enabled for the deployed frontend (FRONTEND_URL) and the Next.js dev default
(http://localhost:3000). Unhandled exceptions return the consistent JSON error format.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from config import settings


def setup_middleware(app: FastAPI) -> None:
    """Attach CORS middleware and a global exception handler."""
    origins = list(
        {
            settings.frontend_url,
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        }
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=settings.frontend_origin_regex or None,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "code": "INTERNAL_ERROR",
                "status": 500,
            },
        )
