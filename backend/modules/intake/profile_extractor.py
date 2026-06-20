"""Parses and validates the LLM's [PROFILE_COMPLETE] JSON output into a UserProfile.

The intake LLM signals completion by emitting the marker `[PROFILE_COMPLETE]` on
its own line followed by a JSON object. This module detects that marker, parses the
trailing JSON, derives `adults`, and validates against the UserProfile schema.
"""

import json
import logging
from datetime import datetime, timezone

from pydantic import ValidationError

from backend.schemas import UserProfile

logger = logging.getLogger(__name__)

MARKER = "[PROFILE_COMPLETE]"


def _extract_json_block(text: str) -> str | None:
    """Return the JSON object substring that follows the marker, or None."""
    idx = text.find(MARKER)
    if idx == -1:
        return None
    after = text[idx + len(MARKER):]
    start = after.find("{")
    if start == -1:
        return None
    # Balance braces to find the end of the JSON object.
    depth = 0
    for i in range(start, len(after)):
        char = after[i]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return after[start:i + 1]
    return None


def extract_profile(session_id: str, llm_response: str) -> tuple[bool, UserProfile | None]:
    """Detect the [PROFILE_COMPLETE] marker and parse the trailing JSON.

    Returns (False, None) if the marker is absent or parsing/validation fails.
    On success returns (True, UserProfile(...)) with session_id set,
    profile_complete=True, collected_at=now, and adults derived from
    household_size - children_under_18 (clamped to min 1).
    """
    if MARKER not in llm_response:
        return False, None

    json_block = _extract_json_block(llm_response)
    if json_block is None:
        logger.warning("PROFILE_COMPLETE marker found but no JSON object followed it.")
        return False, None

    try:
        data = json.loads(json_block)
    except json.JSONDecodeError as exc:
        logger.warning("Failed to parse PROFILE_COMPLETE JSON: %s", exc)
        return False, None

    household_size = int(data.get("household_size", 1))
    children = int(data.get("children_under_18", 0))
    data["adults"] = max(1, household_size - children)
    data["session_id"] = session_id
    data["profile_complete"] = True
    data["collected_at"] = datetime.now(timezone.utc)

    try:
        profile = UserProfile(**data)
    except ValidationError as exc:
        logger.warning("PROFILE_COMPLETE JSON failed validation: %s", exc)
        return False, None

    return True, profile
