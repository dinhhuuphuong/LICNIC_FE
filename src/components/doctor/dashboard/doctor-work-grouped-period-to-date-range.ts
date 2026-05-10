import DATE_FORMAT from '@/constants/date-format';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export type DoctorWorkDaysGroupBy = 'month' | 'quarter' | 'year';

/** Khoảng work_date (YYYY-MM-DD) khớp mốc `period` từ statistics_get_doctor_work_days_grouped. */
export function doctorWorkGroupedPeriodToDateRange(
  period: string,
  groupBy: DoctorWorkDaysGroupBy,
): { from: string; to: string } {
  if (groupBy === 'year') {
    const y = Number(period);
    const yearNum = Number.isFinite(y) ? y : dayjs().year();
    const start = dayjs().year(yearNum).startOf('year');
    const end = dayjs().year(yearNum).endOf('year');
    return { from: start.format(DATE_FORMAT.DB_DATE), to: end.format(DATE_FORMAT.DB_DATE) };
  }

  if (groupBy === 'quarter') {
    const m = period.match(/^(\d{4})-Q0?([1-4])$/i);
    if (m) {
      const y = Number(m[1]);
      const q = Number(m[2]);
      const month0 = (q - 1) * 3;
      const start = dayjs().year(y).month(month0).startOf('month');
      const end = dayjs().year(y).month(month0 + 2).endOf('month');
      return { from: start.format(DATE_FORMAT.DB_DATE), to: end.format(DATE_FORMAT.DB_DATE) };
    }
    const today = dayjs().format(DATE_FORMAT.DB_DATE);
    return { from: today, to: today };
  }

  const d = dayjs(period, DATE_FORMAT.MONTH_YEAR_DB, true);
  const base = d.isValid() ? d : dayjs();
  return {
    from: base.startOf('month').format(DATE_FORMAT.DB_DATE),
    to: base.endOf('month').format(DATE_FORMAT.DB_DATE),
  };
}
