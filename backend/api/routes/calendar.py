"""Short-lived Google Calendar OAuth and event insertion for the Action Center."""

import hashlib
import hmac
import secrets
import time
from datetime import date, datetime, timedelta
from urllib.parse import quote, urlencode

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from backend.config import settings
from backend.schemas import CalendarAuthorizeResponse, CalendarEventsRequest, CalendarEventsResponse

router = APIRouter()


def _configured() -> bool:
    return bool(
        settings.google_calendar_client_id
        and settings.google_calendar_client_secret
        and settings.calendar_state_secret
    )


@router.get("/status", response_model=CalendarAuthorizeResponse)
async def calendar_status() -> CalendarAuthorizeResponse:
    return CalendarAuthorizeResponse(configured=_configured())


@router.get("/authorize", response_model=CalendarAuthorizeResponse)
async def calendar_authorize() -> CalendarAuthorizeResponse:
    if not _configured():
        return CalendarAuthorizeResponse(configured=False)
    state = _make_state()
    params = {
        "client_id": settings.google_calendar_client_id,
        "redirect_uri": settings.google_calendar_redirect_uri,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/calendar.events",
        "access_type": "online",
        "include_granted_scopes": "true",
        "prompt": "consent",
        "state": state,
    }
    return CalendarAuthorizeResponse(
        configured=True,
        authorization_url=f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}",
    )


@router.get("/callback")
async def calendar_callback(code: str | None = None, state: str | None = None, error: str | None = None):
    frontend = settings.frontend_url.rstrip("/")
    if error or not code or not state or not _verify_state(state):
        return RedirectResponse(f"{frontend}/action-center/timeline?calendar_error=authorization_denied")
    return RedirectResponse(
        f"{frontend}/action-center/timeline?calendar_code={quote(code)}&calendar_state={quote(state)}"
    )


@router.post("/events", response_model=CalendarEventsResponse)
async def create_calendar_events(body: CalendarEventsRequest) -> CalendarEventsResponse:
    if not _verify_state(body.state):
        raise HTTPException(status_code=401, detail="Calendar authorization expired; reconnect Google Calendar")
    created = 0
    skipped = 0
    errors: list[str] = []
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": body.authorization_code,
                "client_id": settings.google_calendar_client_id,
                "client_secret": settings.google_calendar_client_secret,
                "redirect_uri": settings.google_calendar_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_response.status_code >= 400:
            raise HTTPException(status_code=401, detail="Calendar authorization code is invalid or already used")
        access_token = token_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}
        for task in body.tasks:
            existing = await client.get(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                params={
                    "privateExtendedProperty": f"aidCompassTaskId={task.id}",
                    "maxResults": 1,
                    "singleEvents": "true",
                },
                headers=headers,
            )
            if existing.status_code < 400 and existing.json().get("items"):
                skipped += 1
                continue
            event = _event_from_task(task.model_dump())
            response = await client.post(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                json=event,
                headers=headers,
            )
            if response.status_code >= 400:
                errors.append(task.title)
                continue
            created += 1
    return CalendarEventsResponse(created=created, skipped=skipped, errors=errors)


def _event_from_task(task: dict) -> dict:
    due_at = task["due_at"]
    description = task["description"]
    if task.get("url"):
        description += f"\n\nLink: {task['url']}"
    if "T" in due_at:
        start = datetime.fromisoformat(due_at)
        end = start + timedelta(minutes=task.get("duration_minutes") or 30)
        start_value = {"dateTime": start.isoformat(), "timeZone": "UTC"}
        end_value = {"dateTime": end.isoformat(), "timeZone": "UTC"}
    else:
        start_date = date.fromisoformat(due_at)
        start_value = {"date": start_date.isoformat()}
        end_value = {"date": (start_date + timedelta(days=1)).isoformat()}
    return {
        "summary": task["title"],
        "description": description,
        "location": task.get("location") or "",
        "start": start_value,
        "end": end_value,
        "reminders": {
            "useDefault": False,
            "overrides": [{"method": "popup", "minutes": 1440}, {"method": "popup", "minutes": 120}],
        },
        "extendedProperties": {"private": {"aidCompassTaskId": task["id"]}},
    }


def _make_state() -> str:
    payload = f"{int(time.time())}.{secrets.token_urlsafe(18)}"
    signature = hmac.new(
        settings.calendar_state_secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return f"{payload}.{signature}"


def _verify_state(state: str) -> bool:
    if not _configured():
        return False
    try:
        timestamp_value, nonce, supplied_signature = state.split(".", 2)
        timestamp = int(timestamp_value)
    except (TypeError, ValueError):
        return False
    if not nonce or abs(time.time() - timestamp) > 15 * 60:
        return False
    payload = f"{timestamp_value}.{nonce}"
    expected = hmac.new(
        settings.calendar_state_secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(supplied_signature, expected)
