"""Deterministic Action Center timeline endpoints."""

from fastapi import APIRouter

from modules.timeline.builder import TimelineBuilder
from schemas import ActionTimeline, TimelineBuildRequest

router = APIRouter()
builder = TimelineBuilder()


@router.post("/build", response_model=ActionTimeline)
async def build_timeline(body: TimelineBuildRequest) -> ActionTimeline:
    return builder.build(body.program_ids, body.document_analyses, body.selected_resources, body.target_date)
