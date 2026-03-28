/** Chuẩn hóa "H:mm:ss" | "HH:mm" → "HH:mm:ss" để so sánh / gửi API. */
export function toHhMmSs(time: string): string {
  const t = time.trim();
  const parts = t.split(':').map((p) => p.trim());
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  const s = Number(parts[2] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return '00:00:00';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = toHhMmSs(time).split(':').map(Number);
  return h * 60 + m;
}

/** Quy tắc backend: startTime <= t < endTime */
export function isTimeWithinScheduleWindow(
  appointmentTime: string,
  scheduleStart: string,
  scheduleEnd: string,
): boolean {
  const t = timeToMinutes(appointmentTime);
  const start = timeToMinutes(scheduleStart);
  const end = timeToMinutes(scheduleEnd);
  return t >= start && t < end;
}

const DEFAULT_SLOT_STEP_MINUTES = 30;

/** Sinh khung giờ bắt đầu (HH:mm) từ các ca đã duyệt; bước cố định khi API không trả slotDurationMinutes. */
export function buildSlotStartsFromSchedules(
  schedules: Array<{ startTime: string; endTime: string; status: string }>,
  stepMinutes: number = DEFAULT_SLOT_STEP_MINUTES,
): string[] {
  const approved = schedules.filter((s) => s.status === 'approved');
  const starts = new Set<string>();

  for (const s of approved) {
    let cur = timeToMinutes(s.startTime);
    const end = timeToMinutes(s.endTime);
    while (cur + stepMinutes <= end) {
      const hh = Math.floor(cur / 60);
      const mm = cur % 60;
      starts.add(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
      cur += stepMinutes;
    }
  }

  return [...starts].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}
