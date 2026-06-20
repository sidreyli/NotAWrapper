from types import SimpleNamespace

import pytest

from modules.intake.conversation import IntakeConversation
from schemas import IntakeMessage


class FakeMessages:
    def __init__(self) -> None:
        self.last_request = None

    def create(self, **kwargs):
        self.last_request = kwargs
        return SimpleNamespace(content=[SimpleNamespace(text="What is your monthly income?")])


@pytest.mark.asyncio
async def test_history_is_supplied_by_the_caller_without_server_session_state() -> None:
    messages = FakeMessages()
    conversation = IntakeConversation(SimpleNamespace(messages=messages))
    history = [IntakeMessage(role="assistant", content="Which state do you live in?")]

    result = await conversation.send_message("browser-session", "California", history)

    assert result.session_id == "browser-session"
    assert result.is_complete is False
    assert [message["role"] for message in messages.last_request["messages"]] == ["assistant", "user"]
    assert messages.last_request["messages"][-1]["content"] == "California"
