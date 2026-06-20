from datetime import date

from backend.modules.timeline.builder import TimelineBuilder
from backend.schemas import DetectedDeadline, DocumentAnalysis


def test_builds_program_plan_with_stable_ids() -> None:
    builder = TimelineBuilder()
    first = builder.build(["snap"], [], [], date(2026, 7, 10))
    second = builder.build(["snap"], [], [], date(2026, 7, 10))

    assert [task.kind for task in first.tasks] == ["document", "apply", "follow_up"]
    assert [task.id for task in first.tasks] == [task.id for task in second.tasks]
    assert all(task.date_source == "suggested" for task in first.tasks)


def test_preserves_reviewed_document_deadline() -> None:
    analysis = DocumentAnalysis(
        file_name="renewal.pdf",
        document_type="Renewal notice",
        summary="A renewal notice.",
        deadlines=[
            DetectedDeadline(
                label="Return renewal form",
                date="2026-07-04",
                evidence="Return by July 4, 2026",
                confidence=0.98,
                page=1,
            )
        ],
    )

    timeline = TimelineBuilder().build([], [analysis], [], date(2026, 7, 10))

    assert len(timeline.tasks) == 1
    assert timeline.tasks[0].date_source == "extracted"
    assert timeline.tasks[0].due_at == "2026-07-04"
