export function formatDate(date: Date, timeZone: string = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "medium",
    dateStyle: "medium",
    timeZone: timeZone,
  }).format(date);
}

// Function to get the local timezone dynamically
export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}