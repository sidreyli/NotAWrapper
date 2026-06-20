import type { ActionTask } from "@/types/api";

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function compactDate(value: string): string {
  return value.slice(0, 10).replace(/-/g, "");
}

function nextDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

export function downloadTimeline(tasks: ActionTask[]): void {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const events = tasks.map((task) => {
    const lines = [
      "BEGIN:VEVENT",
      `UID:${task.id}@aidcompass`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${compactDate(task.due_at)}`,
      `DTEND;VALUE=DATE:${nextDate(task.due_at)}`,
      `SUMMARY:${escape(task.title)}`,
      `DESCRIPTION:${escape(`${task.description}${task.url ? `\n\n${task.url}` : ""}`)}`,
      task.location ? `LOCATION:${escape(task.location)}` : "",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escape(task.title)}`,
      "END:VALARM",
      "END:VEVENT"
    ];
    return lines.filter(Boolean).join("\r\n");
  });
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aid Compass//Action Center//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "aid-compass-action-plan.ics";
  link.click();
  URL.revokeObjectURL(url);
}
