from backend.modules.documents.analyzer import _strip_code_fence
from backend.api.routes.documents import _matches_signature


def test_strips_json_code_fence() -> None:
    assert _strip_code_fence('```json\n{"summary":"ok"}\n```') == '{"summary":"ok"}'


def test_leaves_plain_json_unchanged() -> None:
    assert _strip_code_fence('{"summary":"ok"}') == '{"summary":"ok"}'


def test_upload_signatures_must_match_media_type() -> None:
    assert _matches_signature(b"%PDF-1.7 sample", "application/pdf")
    assert _matches_signature(b"\x89PNG\r\n\x1a\nrest", "image/png")
    assert not _matches_signature(b"<script>alert(1)</script>", "application/pdf")
