export function formatDate(date: Date, timeZone: string = "UTC"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeStyle: "medium",
    dateStyle: "medium",
    timeZone: timeZone,
  }).format(date);
}

// Function to check if the plan is still valid
export function isPlanValid(startAt: string, endAt: string): boolean {
  const currentDate = new Date();
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  return currentDate >= startDate && currentDate <= endDate;
}
