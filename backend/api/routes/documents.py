"""Ephemeral document and agency-notice analysis endpoints."""

import re
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from backend.schemas import DocumentAnalysis

router = APIRouter()

ALLOWED_MEDIA_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
MAX_FILE_BYTES = 4 * 1024 * 1024


@router.post("/analyze", response_model=DocumentAnalysis)
async def analyze_document(
    request: Request,
    file: UploadFile = File(...),
    program_ids: str = Form(""),
) -> DocumentAnalysis:
    if file.content_type not in ALLOWED_MEDIA_TYPES:
        raise HTTPException(status_code=415, detail="Upload a PDF, JPEG, PNG, or WebP file")
    data = await file.read(MAX_FILE_BYTES + 1)
    await file.close()
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="The file must be smaller than 4 MB")
    if not _matches_signature(data, file.content_type):
        raise HTTPException(status_code=400, detail="The file contents do not match the selected file type")

    selected = [value.strip().lower() for value in program_ids.split(",") if value.strip()]
    if not selected:
        selected = ["snap", "medicaid", "chip", "liheap", "wic", "tanf"]
    analyzer = request.app.state.document_analyzer
    safe_name = re.sub(r"[\x00-\x1f\x7f]", "", Path(file.filename or "uploaded-document").name)[:120]
    return await analyzer.analyze(data, file.content_type, safe_name or "uploaded-document", selected)


def _matches_signature(data: bytes, media_type: str) -> bool:
    if media_type == "application/pdf":
        return data.startswith(b"%PDF-")
    if media_type == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff")
    if media_type == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if media_type == "image/webp":
        return len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    return False
