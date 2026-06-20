from backend.api.routes.calendar import _make_state, _verify_state
from backend.config import settings


def test_calendar_state_is_signed_and_tamper_evident(monkeypatch) -> None:
    monkeypatch.setattr(settings, "google_calendar_client_id", "client")
    monkeypatch.setattr(settings, "google_calendar_client_secret", "secret")
    monkeypatch.setattr(settings, "calendar_state_secret", "a-long-independent-state-secret")

    state = _make_state()

    assert _verify_state(state)
    replacement = "0" if state[-1] != "0" else "1"
    assert not _verify_state(f"{state[:-1]}{replacement}")
