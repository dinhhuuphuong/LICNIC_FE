import { AppointmentStatusBadge, type AppointmentStatus } from '@/components/AppointmentStatusBadge';
import type { AppointmentListItem } from '@/services/appointmentService';
import { formatYmdToDmy } from '@/utils/dateDisplay';
import { Link } from 'react-router-dom';

type DoctorScheduleAppointmentsSectionProps = {
  variant?: 'overview' | 'details';
  isVi: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  appointments: AppointmentListItem[];
  sectionTitle: string;
  loadingLabel: string;
  emptyLabel: string;
  /** Hiển thị ngày trên mỗi dòng (ví dụ phạm vi tháng). */
  showAppointmentDate?: boolean;
  /** Khi có — mỗi dòng là liên kết tới trang chi tiết lịch hẹn. */
  appointmentDetailHref?: (appointmentId: number) => string;
};

export function DoctorScheduleAppointmentsSection(props: DoctorScheduleAppointmentsSectionProps) {
  const {
    variant = 'overview',
    isVi,
    isLoading,
    isError,
    error,
    appointments,
    sectionTitle,
    loadingLabel,
    emptyLabel,
    showAppointmentDate = false,
    appointmentDetailHref,
  } = props;

  const isDetails = variant === 'details';

  const outerClass = isDetails
    ? 'mt-4 border-t border-slate-200 pt-4'
    : 'mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-sm';

  const titleClass = isDetails
    ? 'mb-2 text-sm font-semibold text-slate-900'
    : 'mb-2 text-base font-semibold text-slate-800';

  const statusTextClass = isDetails ? 'text-sm text-slate-600' : 'text-slate-600';
  const errorTextClass = isDetails ? 'text-sm text-red-600' : 'text-red-600';

  const itemCardClass = isDetails
    ? 'rounded border border-slate-200 px-3 py-2 text-sm'
    : 'rounded border border-slate-200 bg-white px-3 py-2';

  const interactiveCardClass = appointmentDetailHref
    ? `${itemCardClass} block cursor-pointer transition-colors hover:border-blue-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500`
    : itemCardClass;

  return (
    <div className={outerClass}>
      <h3 className={titleClass}>{sectionTitle}</h3>
      {isLoading ? (
        <p className={statusTextClass}>{loadingLabel}</p>
      ) : isError ? (
        <p className={errorTextClass}>{error instanceof Error ? error.message : 'Error'}</p>
      ) : appointments.length === 0 ? (
        <p className={statusTextClass}>{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {appointments.map((appt) => {
            const inner = (
              <>
                {showAppointmentDate ? (
                  <div className="mb-1 text-xs text-slate-500">{formatYmdToDmy(appt.appointmentDate)}</div>
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-800">{appt.patientName}</div>
                    <div className="text-slate-600">
                      {appt.appointmentTime}
                      {appt.serviceName ? ` · ${appt.serviceName}` : null}
                    </div>
                  </div>
                  <AppointmentStatusBadge status={appt.status as AppointmentStatus} isVi={isVi} />
                </div>
              </>
            );

            if (appointmentDetailHref) {
              return (
                <Link
                  key={appt.appointmentId}
                  to={appointmentDetailHref(appt.appointmentId)}
                  className={interactiveCardClass}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <div key={appt.appointmentId} className={itemCardClass}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
