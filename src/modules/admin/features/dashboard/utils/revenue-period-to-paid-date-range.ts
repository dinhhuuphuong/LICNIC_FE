import DATE_FORMAT from '@/constants/date-format';
import type { AppointmentGroupBy } from '@/services/statisticsService';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);

/** Khoảng ngày (DB YYYY-MM-DD) để lọc thanh toán đã paid khớp một mốc `period` trên biểu đồ doanh thu. */
export function revenuePeriodToPaidDateRange(
  period: string,
  groupBy: AppointmentGroupBy,
): { from: string; to: string } {
  switch (groupBy) {
    case 'day': {
      const d = dayjs(period, DATE_FORMAT.DB_DATE, true);
      const base = d.isValid() ? d : dayjs(period);
      const s = (base.isValid() ? base : dayjs()).format(DATE_FORMAT.DB_DATE);
      return { from: s, to: s };
    }
    case 'week': {
      const m = period.match(/^(\d{4})-W(\d{2})$/i);
      if (!m) {
        const today = dayjs().format(DATE_FORMAT.DB_DATE);
        return { from: today, to: today };
      }
      const y = Number(m[1]);
      const w = Number(m[2]);
      // ISO week: tuần 1 là tuần chứa 04/01 (cùng thuật toán date_trunc('week') + IYYY/IW trong PG)
      const start = dayjs(`${y}-01-04`).startOf('isoWeek').add(w - 1, 'week');
      const end = start.add(6, 'day');
      return { from: start.format(DATE_FORMAT.DB_DATE), to: end.format(DATE_FORMAT.DB_DATE) };
    }
    case 'month': {
      const d = dayjs(period, DATE_FORMAT.MONTH_YEAR_DB, true);
      const base = d.isValid() ? d : dayjs(`${period}-01`, DATE_FORMAT.DB_DATE, true);
      const b = base.isValid() ? base : dayjs();
      return {
        from: b.startOf('month').format(DATE_FORMAT.DB_DATE),
        to: b.endOf('month').format(DATE_FORMAT.DB_DATE),
      };
    }
    case 'year': {
      const y = Number(period);
      const yearNum = Number.isFinite(y) ? y : dayjs().year();
      const start = dayjs().year(yearNum).startOf('year');
      const end = dayjs().year(yearNum).endOf('year');
      return { from: start.format(DATE_FORMAT.DB_DATE), to: end.format(DATE_FORMAT.DB_DATE) };
    }
    case 'quarter':
    default: {
      const d = dayjs(period, DATE_FORMAT.DB_DATE, true);
      if (d.isValid()) {
        const s = d.format(DATE_FORMAT.DB_DATE);
        return { from: s, to: s };
      }
      const today = dayjs().format(DATE_FORMAT.DB_DATE);
      return { from: today, to: today };
    }
  }
}
