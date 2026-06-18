"""Static program info + state-specific override loader.

Loads `programs.json` (national program metadata, required documents, data sources)
and `state_programs.json` (per-state thresholds, program names, apply URLs).

SKELETON: both static files are loaded so the module-level singleton constructs.
The merge/lookup helpers are not yet implemented.
"""

import json
from pathlib import Path

_STATIC_DIR = Path(__file__).parent / "static"
_PROGRAMS_FILE = _STATIC_DIR / "programs.json"
_STATE_PROGRAMS_FILE = _STATIC_DIR / "state_programs.json"


class ProgramRegistry:
    """Program metadata and state-specific overrides."""

    _programs: dict | None = None
    _state_programs: dict | None = None

    def __init__(self) -> None:
        if ProgramRegistry._programs is None:
            with open(_PROGRAMS_FILE, encoding="utf-8") as f:
                ProgramRegistry._programs = json.load(f)
        if ProgramRegistry._state_programs is None:
            with open(_STATE_PROGRAMS_FILE, encoding="utf-8") as f:
                ProgramRegistry._state_programs = json.load(f)
        self.programs = ProgramRegistry._programs
        self.state_programs = ProgramRegistry._state_programs

    def get_program(self, program_id: str) -> dict:
        """Returns program info dict. Raises KeyError if not found."""
        return self.programs[program_id]

    def get_state_program(self, state: str, program_id: str) -> dict:
        """Merges program info with state-specific overrides.

        Prefers the state-specific apply_url over the national one.
        Raises ValueError if state not in state_programs.json.
        """
        raise NotImplementedError("TODO: merge national + state program info")

    def get_required_documents(self, program_id: str) -> list[str]:
        return self.programs[program_id]["required_documents"]

    def get_supported_states(self) -> list[str]:
        return list(self.state_programs.keys())

    def is_state_supported(self, state: str) -> bool:
        return state in self.state_programs

    def get_data_source_info(self, program_id: str) -> dict:
        """Returns {source, url, data_as_of} for a program."""
        program = self.programs[program_id]
        return {
            "source": program["data_source"],
            "url": program["more_info_url"],
            "data_as_of": program["data_as_of"],
        }


program_registry = ProgramRegistry()
