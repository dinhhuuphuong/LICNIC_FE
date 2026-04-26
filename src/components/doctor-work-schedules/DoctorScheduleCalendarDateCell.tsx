import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import type { Dayjs } from 'dayjs';

type CalendarMode = 'day' | 'week' | 'month' | 'year' | 'custom';

type DoctorScheduleCalendarDateCellProps = {
  date: Dayjs;
  dateKey: string;
  daySchedules: DoctorWorkSchedule[];
  calendarMode: CalendarMode;
  isDisabled: boolean;
  isSelected: boolean;
  isToday: boolean;
  isVi: boolean;
  onSelect: (dateKey: string) => void;
};

function getScheduleStatusStyle(status: DoctorWorkSchedule['status']) {
  if (status === 'approved') return 'bg-emerald-500';
  if (status === 'rejected') return 'bg-red-500';
  return 'bg-amber-500';
}

export function DoctorScheduleCalendarDateCell(props: DoctorScheduleCalendarDateCellProps) {
  const { date, dateKey, daySchedules, calendarMode, isDisabled, isSelected, isToday, isVi, onSelect } = props;

  return (
    <button
      type="button"
      onClick={() => {
        if (isDisabled) return;
        onSelect(dateKey);
      }}
      disabled={isDisabled}
      className={[
        'relative h-20 border-r border-b border-slate-300 p-1.5 text-left transition',
        'focus:outline-none focus:z-10 focus:shadow-[inset_0_0_0_2px_#93c5fd]',
        isSelected && !isDisabled ? 'bg-red-50' : '',
        isDisabled
          ? 'cursor-not-allowed bg-slate-100 text-slate-300'
          : 'cursor-pointer bg-white hover:bg-slate-50 text-slate-900',
      ].join(' ')}
    >
      <span className="absolute right-1.5 top-0.5 text-lg font-semibold text-slate-400">
        {calendarMode === 'week' || calendarMode === 'custom' ? date.format('DD/MM') : date.date()}
      </span>
      {isToday ? (
        <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {isVi ? 'Hôm nay' : 'Today'}
        </span>
      ) : null}
      {daySchedules.length > 0 ? (
        <div className="absolute bottom-1.5 left-1.5 right-1.5">
          <div className="mb-0.5 text-[10px] font-semibold text-slate-700">
            {isVi ? `${daySchedules.length} ca` : `${daySchedules.length} shifts`}
          </div>
          <div className="flex flex-wrap gap-1">
            {daySchedules.slice(0, 3).map((schedule) => (
              <span
                key={schedule.scheduleId}
                className={['h-1.5 w-1.5 rounded-full', getScheduleStatusStyle(schedule.status)].join(' ')}
                title={`${schedule.startTime} - ${schedule.endTime} (${schedule.status})`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </button>
  );
}
