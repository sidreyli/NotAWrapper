"""Build grounded action tasks from program metadata and reviewed case-file data."""

from datetime import date, timedelta
from uuid import NAMESPACE_URL, uuid5

from backend.modules.data_layer.program_registry import program_registry
from backend.schemas import ActionTask, ActionTimeline, DocumentAnalysis, Resource


class TimelineBuilder:
    def build(
        self,
        program_ids: list[str],
        document_analyses: list[DocumentAnalysis],
        selected_resources: list[Resource],
        target_date: date,
    ) -> ActionTimeline:
        tasks: list[ActionTask] = []

        for analysis in document_analyses:
            for deadline in analysis.deadlines:
                if not deadline.date:
                    continue
                try:
                    deadline_date = date.fromisoformat(deadline.date)
                except ValueError:
                    continue
                tasks.append(
                    _task(
                        title=deadline.label,
                        description=f"Deadline found in {analysis.file_name}. Confirm it with the issuing agency. Evidence: {deadline.evidence}",
                        kind="deadline",
                        due_at=deadline_date.isoformat(),
                        date_source="extracted",
                    )
                )

        valid_program_ids = [program_id for program_id in dict.fromkeys(program_ids) if program_id in program_registry.programs]
        first_resource = selected_resources[0] if selected_resources else None
        for index, program_id in enumerate(valid_program_ids):
            program = program_registry.get_program(program_id)
            program_name = program.get("name", program_id.upper())
            program_target = target_date + timedelta(days=index * 2)
            document_date = max(date.today(), program_target - timedelta(days=3))
            required_documents = program.get("required_documents", [])
            checklist_preview = ", ".join(required_documents[:3])
            if len(required_documents) > 3:
                checklist_preview += f", and {len(required_documents) - 3} more"
            tasks.append(
                _task(
                    title=f"Gather documents for {program_name}",
                    description=f"Prepare the program checklist: {checklist_preview}.",
                    kind="document",
                    due_at=document_date.isoformat(),
                    date_source="suggested",
                    program_id=program_id,
                    duration_minutes=30,
                )
            )
            if first_resource:
                visit_date = max(date.today(), program_target - timedelta(days=1))
                tasks.append(
                    _task(
                        title=f"Contact {first_resource.name} about {program_name}",
                        description="Call ahead to confirm that this location handles the service and whether an appointment is required.",
                        kind="visit",
                        due_at=visit_date.isoformat(),
                        date_source="suggested",
                        program_id=program_id,
                        duration_minutes=45,
                        location=first_resource.address,
                        url=first_resource.directions_url or first_resource.website,
                    )
                )
            tasks.append(
                _task(
                    title=f"Apply for {program_name}",
                    description="Review every answer, keep a copy or confirmation number, and submit through the official application.",
                    kind="apply",
                    due_at=program_target.isoformat(),
                    date_source="suggested",
                    program_id=program_id,
                    duration_minutes=45,
                    url=program.get("national_apply_url") or program.get("apply_url"),
                )
            )
            tasks.append(
                _task(
                    title=f"Follow up on {program_name}",
                    description="Check for agency messages, requests for more documents, or an application status update.",
                    kind="follow_up",
                    due_at=(program_target + timedelta(days=14)).isoformat(),
                    date_source="suggested",
                    program_id=program_id,
                    duration_minutes=15,
                )
            )

        tasks.sort(key=lambda task: task.due_at)
        return ActionTimeline(tasks=tasks)


def _task(
    *,
    title: str,
    description: str,
    kind: str,
    due_at: str,
    date_source: str,
    program_id: str | None = None,
    duration_minutes: int | None = None,
    location: str | None = None,
    url: str | None = None,
) -> ActionTask:
    identity = "|".join((title, due_at, program_id or "", location or ""))
    return ActionTask(
        id=str(uuid5(NAMESPACE_URL, identity)),
        title=title,
        description=description,
        kind=kind,
        due_at=due_at,
        date_source=date_source,
        program_id=program_id,
        duration_minutes=duration_minutes,
        location=location,
        url=url,
    )
