export function formatDate(date: Date, timeZone: string = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "medium",
    dateStyle: "medium",
    timeZone: timeZone,
  }).format(date);
}
