export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function format12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function calculateSlotDurationMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  let end = parseTimeToMinutes(endTime);
  if (end < start) {
    end += 1440; // overnight slot
  }
  return end - start;
}

export function formatDurationHuman(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function isSlotActiveNow(startTime: string, endTime: string, now: Date = new Date()): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = parseTimeToMinutes(startTime);
  let end = parseTimeToMinutes(endTime);
  if (end < start) {
    // overnight
    return currentMinutes >= start || currentMinutes < end;
  }
  return currentMinutes >= start && currentMinutes < end;
}

export function getSlotRemainingMinutes(endTime: string, now: Date = new Date()): number {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let end = parseTimeToMinutes(endTime);
  if (end < currentMinutes) {
    end += 1440;
  }
  return Math.max(0, end - currentMinutes);
}

export function getDaysRemainingUntil(targetDate: Date, now: Date = new Date()): number {
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}
