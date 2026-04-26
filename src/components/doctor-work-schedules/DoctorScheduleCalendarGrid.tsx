import DATE_FORMAT from '@/constants/date-format';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DoctorScheduleCalendarDateCell } from './DoctorScheduleCalendarDateCell';

type CalendarMode = 'day' | 'week' | 'month' | 'year' | 'custom';

type DoctorScheduleCalendarGridProps = {
  calendarMode: Extract<CalendarMode, 'week' | 'month' | 'custom'>;
  weekdayLabels: string[];
  dates: Dayjs[];
  schedulesByDate: Map<string, DoctorWorkSchedule[]>;
  selectedDate: string;
  rangeStart: Dayjs;
  rangeEnd: Dayjs;
  viewMonth: Dayjs;
  isVi: boolean;
  onSelectDate: (date: string) => void;
};

export function DoctorScheduleCalendarGrid(props: DoctorScheduleCalendarGridProps) {
  const {
    calendarMode,
    weekdayLabels,
    dates,
    schedulesByDate,
    selectedDate,
    rangeStart,
    rangeEnd,
    viewMonth,
    isVi,
    onSelectDate,
  } = props;

  return (
    <>
      <div className="grid grid-cols-7 border-b border-slate-300 bg-slate-100">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-2 text-center text-xl font-medium text-slate-700">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dates.map((date) => {
          const dateKey = date.format(DATE_FORMAT.DB_DATE);
          const daySchedules = schedulesByDate.get(dateKey) ?? [];
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === dayjs().format(DATE_FORMAT.DB_DATE);
          const isOutOfCurrentRange = date.isBefore(rangeStart) || date.isAfter(rangeEnd);
          const inCurrentMonth = date.month() === viewMonth.month();
          const isDisabled = calendarMode === 'month' ? !inCurrentMonth || isOutOfCurrentRange : isOutOfCurrentRange;

          return (
            <DoctorScheduleCalendarDateCell
              key={dateKey}
              date={date}
              dateKey={dateKey}
              daySchedules={daySchedules}
              calendarMode={calendarMode}
              isDisabled={isDisabled}
              isSelected={isSelected}
              isToday={isToday}
              isVi={isVi}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
    </>
  );
}
