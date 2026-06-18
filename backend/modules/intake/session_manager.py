"""In-memory intake session store.

No PII is persisted beyond this process. Sessions expire after 2 hours of
inactivity (by `updated_at`). Server restart clears all sessions.
"""

import uuid
from datetime import datetime, timedelta

from backend.schemas import IntakeSession, IntakeMessage, UserProfile

# Module-level store (not class-level), per spec.
_sessions: dict[str, IntakeSession] = {}

_SESSION_TTL = timedelta(hours=2)


class SessionManager:
    """Create, fetch, update, and expire in-memory intake sessions."""

    def create_session(self) -> IntakeSession:
        session = IntakeSession(
            session_id=str(uuid.uuid4()),
            messages=[],
            profile=None,
            is_complete=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        _sessions[session.session_id] = session
        return session

    def get_session(self, session_id: str) -> IntakeSession:
        """Raises KeyError if not found."""
        return _sessions[session_id]

    def update_session(self, session: IntakeSession) -> None:
        _sessions[session.session_id] = session

    def add_message(self, session_id: str, role: str, content: str) -> None:
        session = _sessions[session_id]
        session.messages.append(IntakeMessage(role=role, content=content))
        session.updated_at = datetime.utcnow()

    def mark_complete(self, session_id: str, profile: UserProfile) -> None:
        session = _sessions[session_id]
        session.is_complete = True
        session.profile = profile
        session.updated_at = datetime.utcnow()

    def cleanup_expired_sessions(self) -> int:
        """Removes sessions older than 2 hours (by updated_at). Returns count removed."""
        cutoff = datetime.utcnow() - _SESSION_TTL
        expired = [sid for sid, s in _sessions.items() if s.updated_at < cutoff]
        for sid in expired:
            del _sessions[sid]
        return len(expired)

    def get_session_count(self) -> int:
        return len(_sessions)


session_manager = SessionManager()
