import { http, type Response } from '@/services/http';

const CLINIC_INFO_URL = '/clinic-info';

export type ClinicInfo = {
  introduction: string;
  workingHours: string;
  address: string;
};

export type GetClinicInfoResponse = Response<ClinicInfo>;

export type WorkingRange = {
  start: string;
  end: string;
};

const WEEKDAY_RANGE: WorkingRange = { start: '08:00', end: '20:00' };
const WEEKEND_RANGE: WorkingRange = { start: '08:00', end: '17:00' };

const DAY_LABEL_TO_INDEX: Record<string, number> = {
  CN: 0,
  T2: 1,
  T3: 2,
  T4: 3,
  T5: 4,
  T6: 5,
  T7: 6,
};

function buildDefaultWorkingRangeMap() {
  return {
    0: WEEKEND_RANGE,
    1: WEEKDAY_RANGE,
    2: WEEKDAY_RANGE,
    3: WEEKDAY_RANGE,
    4: WEEKDAY_RANGE,
    5: WEEKDAY_RANGE,
    6: WEEKEND_RANGE,
  } as Record<number, WorkingRange>;
}

export function parseWorkingHours(workingHours?: string | null) {
  const byDay = buildDefaultWorkingRangeMap();
  if (!workingHours) return byDay;

  const segments = workingHours
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const parts = segment.split(':');
    if (parts.length < 2) continue;

    const dayPart = parts[0].trim().toUpperCase();
    const timePart = parts.slice(1).join(':').trim();
    const timeMatch = /([0-2]\d:[0-5]\d)-([0-2]\d:[0-5]\d)/.exec(timePart);
    if (!timeMatch) continue;

    const range: WorkingRange = { start: timeMatch[1], end: timeMatch[2] };

    if (dayPart.includes('-')) {
      const [fromLabelRaw, toLabelRaw] = dayPart.split('-');
      const fromLabel = fromLabelRaw.trim();
      const toLabel = toLabelRaw.trim();
      const from = DAY_LABEL_TO_INDEX[fromLabel];
      const to = DAY_LABEL_TO_INDEX[toLabel];
      if (from == null || to == null) continue;

      if (from <= to) {
        for (let day = from; day <= to; day += 1) {
          byDay[day] = range;
        }
      } else {
        for (let day = from; day <= 6; day += 1) byDay[day] = range;
        for (let day = 0; day <= to; day += 1) byDay[day] = range;
      }
      continue;
    }

    const day = DAY_LABEL_TO_INDEX[dayPart];
    if (day != null) {
      byDay[day] = range;
    }
  }

  return byDay;
}

export function getWorkingRangeByDay(dayIndex: number, workingHours?: string | null): WorkingRange {
  const byDay = parseWorkingHours(workingHours);
  return byDay[dayIndex] ?? WEEKDAY_RANGE;
}

export function getClinicInfo() {
  return http<GetClinicInfoResponse>(CLINIC_INFO_URL, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}
