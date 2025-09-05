export function calculateDurationMs(startTime: Date, endTime: Date): number {
  return Math.round(endTime.getTime() - startTime.getTime());
}
