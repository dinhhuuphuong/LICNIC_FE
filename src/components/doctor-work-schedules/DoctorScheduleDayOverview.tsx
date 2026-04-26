import DATE_FORMAT from '@/constants/date-format';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import dayjs from 'dayjs';
import { DoctorScheduleRejectionReason } from './DoctorScheduleRejectionReason';

type DoctorScheduleDayOverviewProps = {
  isVi: boolean;
  selectedDate: string;
  schedules: DoctorWorkSchedule[];
};

function getScheduleStatusStyle(status: DoctorWorkSchedule['status']) {
  if (status === 'approved') return 'bg-emerald-500';
  if (status === 'rejected') return 'bg-red-500';
  return 'bg-amber-500';
}

export function DoctorScheduleDayOverview(props: DoctorScheduleDayOverviewProps) {
  const { isVi, selectedDate, schedules } = props;

  return (
    <div className="p-4">
      <div className="mb-3 text-base font-semibold text-slate-800">
        {dayjs(selectedDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE)}
      </div>
      <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="text-slate-600">
          {isVi ? `Tổng số ca trong ngày: ${schedules.length}` : `Total shifts in day: ${schedules.length}`}
        </div>
        {schedules.length === 0 ? (
          <p className="mt-2 text-slate-500">
            {isVi ? 'Không có ca làm việc cho ngày này.' : 'No work shifts found for this day.'}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.scheduleId} className="rounded border border-slate-200 bg-white px-3 py-2">
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
    </div>
  );
}
