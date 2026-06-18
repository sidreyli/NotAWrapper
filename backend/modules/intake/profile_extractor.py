"""Parses and validates the LLM's [PROFILE_COMPLETE] JSON output into a UserProfile.

SKELETON: not yet implemented. See CLAUDE.md Module C for the marker-detection,
JSON-parse, validation, and adults-derivation logic.
"""

from backend.schemas import UserProfile


def extract_profile(session_id: str, llm_response: str) -> tuple[bool, UserProfile | None]:
    """Detect the [PROFILE_COMPLETE] marker and parse the trailing JSON.

    Returns (False, None) if the marker is absent or parsing/validation fails.
    On success returns (True, UserProfile(...)) with session_id set,
    profile_complete=True, collected_at=now, and adults derived from
    household_size - children_under_18 (clamped to min 1).
    """
    raise NotImplementedError("TODO: implement profile extraction")
