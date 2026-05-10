import DATE_FORMAT from '@/constants/date-format';
import { getDoctorAppointmentDetailRoute } from '@/constants/routes';
import { getAppointments } from '@/services/appointmentService';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { DoctorScheduleAppointmentsSection } from './DoctorScheduleAppointmentsSection';
import { DoctorScheduleRejectionReason } from './DoctorScheduleRejectionReason';

type DoctorScheduleDayOverviewProps = {
  doctorId: number;
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
  const { doctorId, isVi, selectedDate, schedules } = props;

  const appointmentsQuery = useQuery({
    queryKey: ['doctorScheduleDayOverviewAppointments', doctorId, selectedDate],
    queryFn: () =>
      getAppointments({
        doctorId,
        fromDate: selectedDate,
        toDate: selectedDate,
        page: 1,
        limit: 200,
      }),
    enabled: !!doctorId,
  });

  const sortedAppointments = useMemo(() => {
    const items = appointmentsQuery.data?.data.items ?? [];
    return [...items].sort((a, b) => {
      const dateCmp = a.appointmentDate.localeCompare(b.appointmentDate);
      if (dateCmp !== 0) return dateCmp;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    });
  }, [appointmentsQuery.data]);

  const appointmentsSectionTitle = isVi ? 'Lịch hẹn' : 'Appointments';
  const appointmentsLoadingLabel = isVi ? 'Đang tải lịch hẹn…' : 'Loading appointments…';
  const appointmentsEmptyLabel = isVi ? 'Không có lịch hẹn trong ngày này.' : 'No appointments on this date.';

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

      <DoctorScheduleAppointmentsSection
        isVi={isVi}
        isLoading={appointmentsQuery.isLoading}
        isError={appointmentsQuery.isError}
        error={appointmentsQuery.error}
        appointments={sortedAppointments}
        sectionTitle={appointmentsSectionTitle}
        loadingLabel={appointmentsLoadingLabel}
        emptyLabel={appointmentsEmptyLabel}
        appointmentDetailHref={getDoctorAppointmentDetailRoute}
      />
    </div>
  );
}
