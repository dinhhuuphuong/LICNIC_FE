import DATE_FORMAT from '@/constants/date-format';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import dayjs from 'dayjs';
import { DoctorScheduleRejectionReason } from './DoctorScheduleRejectionReason';

type DoctorScheduleDayDetailsProps = {
  isVi: boolean;
  selectedDate: string;
  schedules: DoctorWorkSchedule[];
  className?: string;
  scope?: 'day' | 'month';
};

function getScheduleStatusStyle(status: DoctorWorkSchedule['status']) {
  if (status === 'approved') return 'bg-emerald-500';
  if (status === 'rejected') return 'bg-red-500';
  return 'bg-amber-500';
}

export function DoctorScheduleDayDetails(props: DoctorScheduleDayDetailsProps) {
  const { isVi, selectedDate, schedules, className, scope = 'day' } = props;
  const isMonthScope = scope === 'month';
  const title = isMonthScope ? (isVi ? 'Chi tiết tháng' : 'Month details') : isVi ? 'Chi tiết ngày' : 'Day details';
  const selectedLabel = dayjs(selectedDate, DATE_FORMAT.DB_DATE).format(
    isMonthScope ? (isVi ? 'MM/YYYY' : 'MMM YYYY') : DATE_FORMAT.DATE,
  );
  const totalLabel = isMonthScope
    ? isVi
      ? `Tổng số ca trong tháng: ${schedules.length}`
      : `Total shifts in month: ${schedules.length}`
    : isVi
      ? `Tổng số ca trong ngày: ${schedules.length}`
      : `Total shifts in day: ${schedules.length}`;
  const emptyLabel = isMonthScope
    ? isVi
      ? 'Không có ca làm việc trong tháng này.'
      : 'No work shifts found for this month.'
    : isVi
      ? 'Không có ca làm việc trong ngày này.'
      : 'No work shifts found for this date.';

  return (
    <div className={className ?? 'h-fit rounded border border-slate-300 bg-white p-4 lg:sticky lg:top-4'}>
      <h2 className="mb-2 text-base font-semibold text-slate-900">
        {title}: {selectedLabel}
      </h2>
      <p className="mb-3 text-sm text-slate-600">{totalLabel}</p>
      {schedules.length === 0 ? (
        <p className="text-sm text-slate-600">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div key={schedule.scheduleId} className="rounded border border-slate-200 px-3 py-2 text-sm">
              {isMonthScope ? (
                <div className="mb-1 font-medium text-slate-800">
                  {dayjs(schedule.workDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE)}
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-800">
                  {schedule.startTime} - {schedule.endTime}
                </div>
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-xs text-white',
                    getScheduleStatusStyle(schedule.status),
                  ].join(' ')}
                >
                  {schedule.status}
                </span>
              </div>
              {schedule.status === 'rejected' ? (
                <DoctorScheduleRejectionReason isVi={isVi} rejectionReason={schedule.rejectionReason} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
