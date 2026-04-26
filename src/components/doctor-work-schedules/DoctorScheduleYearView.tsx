import DATE_FORMAT from '@/constants/date-format';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

type DoctorScheduleYearViewProps = {
  isVi: boolean;
  rangeStart: Dayjs;
  rangeEnd: Dayjs;
  selectedMonthKey: string;
  monthSummary: Map<string, number>;
  schedules: DoctorWorkSchedule[];
  onSelectDate: (date: string) => void;
};

export function DoctorScheduleYearView(props: DoctorScheduleYearViewProps) {
  const { isVi, rangeStart, rangeEnd, selectedMonthKey, monthSummary, schedules, onSelectDate } = props;

  return (
    <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, idx) => {
        const monthDate = rangeStart.startOf('year').month(idx);
        const monthKey = monthDate.format('YYYY-MM');
        const count = monthSummary.get(monthKey) ?? 0;
        const monthStart = monthDate.startOf('month');
        const monthEnd = monthDate.endOf('month');
        const disabled = monthEnd.isBefore(rangeStart) || monthStart.isAfter(rangeEnd);
        const isSelectedMonth = selectedMonthKey === monthKey;

        return (
          <button
            key={monthKey}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              const firstScheduledDateInMonth = schedules
                .map((item) => dayjs(item.workDate, DATE_FORMAT.DB_DATE))
                .filter((workDate) => workDate.isValid() && workDate.isSame(monthDate, 'month'))
                .sort((a, b) => a.valueOf() - b.valueOf())[0];

              onSelectDate((firstScheduledDateInMonth ?? monthStart).format(DATE_FORMAT.DB_DATE));
            }}
            className={[
              'rounded border px-3 py-2 text-left transition',
              disabled
                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300'
                : isSelectedMonth
                  ? 'border-blue-500 bg-blue-50 shadow-[inset_0_0_0_1px_#3b82f6]'
                  : 'border-slate-300 bg-white hover:bg-slate-50',
            ].join(' ')}
          >
            <div className="text-sm font-semibold">{monthDate.format(isVi ? '[Tháng] M' : 'MMM')}</div>
            <div className="mt-1 text-xs text-slate-600">{isVi ? `${count} ca` : `${count} shifts`}</div>
          </button>
        );
      })}
    </div>
  );
}
