import {
  clearServiceBookingDraft,
  loadServiceBookingDraft,
  saveServiceBookingDraft,
} from '@/constants/bookingDraftStorage';
import { RECEPTIONIST_ROLE_ID } from '@/constants/roleIds';
import { ROUTES, getDoctorPublicDetailRoute, getServiceDetailRoute } from '@/constants/routes';
import { createAppointment } from '@/services/appointmentService';
import { createNotificationBestEffort } from '@/services/notificationService';
import { getDoctorWorkSchedulesFromStore, type DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import { getUsers } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { toHhMmSs } from '@/utils/bookingTime';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type Props = {
  serviceId: number;
  serviceName: string;
  isVi: boolean;
};

function todayYmdLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatScheduleTimeRange(start: string, end: string, isVi: boolean): string {
  const s = start.length >= 5 ? start.slice(0, 5) : start;
  const e = end.length >= 5 ? end.slice(0, 5) : end;
  return isVi ? `${s} – ${e}` : `${s} – ${e}`;
}

export function ServiceBookingWizard({ serviceId, serviceName, isVi }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const [workDate, setWorkDate] = useState(todayYmdLocal);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<DoctorWorkSchedule[]>([]);
  const [listLoad, setListLoad] = useState<'idle' | 'loading' | 'error'>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  useEffect(() => {
    const draft = loadServiceBookingDraft(serviceId);
    if (!draft) return;
    if (draft.workDate) setWorkDate(draft.workDate);
    if (draft.appointmentTime) {
      const short = draft.appointmentTime.slice(0, 5);
      setAppointmentTime(short);
    }
    if (draft.scheduleId != null) setSelectedScheduleId(draft.scheduleId);
  }, [serviceId]);

  useEffect(() => {
    const sel = schedules.find((s) => s.scheduleId === selectedScheduleId);
    saveServiceBookingDraft({
      serviceId,
      workDate,
      appointmentTime: appointmentTime ? toHhMmSs(`${appointmentTime}:00`) : undefined,
      scheduleId: selectedScheduleId ?? undefined,
      doctorId: sel?.doctorId,
    });
  }, [serviceId, workDate, appointmentTime, selectedScheduleId, schedules]);

  const persistDraftForAuthRedirect = useCallback(() => {
    const sel = schedules.find((s) => s.scheduleId === selectedScheduleId);
    saveServiceBookingDraft({
      serviceId,
      workDate,
      appointmentTime: appointmentTime ? toHhMmSs(`${appointmentTime}:00`) : undefined,
      scheduleId: selectedScheduleId ?? undefined,
      doctorId: sel?.doctorId,
    });
  }, [appointmentTime, schedules, selectedScheduleId, serviceId, workDate]);

  useEffect(() => {
    if (!workDate || !appointmentTime) {
      setSchedules([]);
      setListLoad('idle');
      setListError(null);
      return;
    }

    let cancelled = false;
    setListLoad('loading');
    setListError(null);
    setSelectedScheduleId(null);

    getDoctorWorkSchedulesFromStore({
      page: 1,
      limit: 500,
      fromDate: workDate,
      toDate: workDate,
      serviceId,
      atTime: toHhMmSs(`${appointmentTime}:00`),
    })
      .then((res) => {
        if (cancelled) return;
        setSchedules(res.data.items);
        setListLoad('idle');
      })
      .catch(() => {
        if (cancelled) return;
        setSchedules([]);
        setListLoad('error');
        setListError(
          isVi ? 'Không tải được lịch làm việc. Vui lòng thử lại.' : 'Could not load schedules. Please try again.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentTime, isVi, serviceId, workDate]);

  const isSlotAvailableForBooking = (s: DoctorWorkSchedule) => s.status === 'approved';

  /** Cho phép chọn ca: đã duyệt và (API không trả appointmentStatus hoặc slot còn trống). */
  const canSelectScheduleRow = (s: DoctorWorkSchedule) =>
    isSlotAvailableForBooking(s) && s.appointmentStatus !== 'Unavailable';

  const notifyReceptionistsNewAppointment = useCallback(
    async (appointmentId: number, dateYmd: string, timeHhMmSs: string) => {
      const receptionists: Array<{ userId: number }> = [];
      const limit = 100;
      let page = 1;

      for (;;) {
        const res = await getUsers({ page, limit, role: RECEPTIONIST_ROLE_ID });
        const chunk = res.data.items ?? [];
        receptionists.push(...chunk.map((u) => ({ userId: u.userId })));
        const total = res.data.total ?? receptionists.length;
        if (receptionists.length >= total || chunk.length === 0) break;
        page += 1;
        if (page > 20) break;
      }

      const hhmm = timeHhMmSs.length >= 5 ? timeHhMmSs.slice(0, 5) : timeHhMmSs;
      const title = isVi ? 'Co lich hen moi duoc tao' : 'New appointment created';
      const content = isVi
        ? `Lich hen #${appointmentId} luc ${hhmm} ngay ${dateYmd} vua duoc tao boi patient.`
        : `Appointment #${appointmentId} at ${hhmm} on ${dateYmd} was created by patient.`;

      await Promise.allSettled(
        receptionists.map((r) =>
          createNotificationBestEffort({
            userId: r.userId,
            title,
            content,
            type: 'appointment_reminder',
            redirectUrl: ROUTES.receptionistAppointments,
          }),
        ),
      );
    },
    [isVi],
  );

  const handleConfirm = async () => {
    setSubmitError(null);
    if (!appointmentTime || selectedScheduleId == null) {
      setSubmitError(isVi ? 'Vui lòng chọn đủ ngày, giờ và bác sĩ.' : 'Please select date, time, and doctor.');
      return;
    }

    const row = schedules.find((s) => s.scheduleId === selectedScheduleId);
    if (!row || !canSelectScheduleRow(row)) {
      setSubmitError(isVi ? 'Khung giờ không hợp lệ.' : 'Invalid time slot.');
      return;
    }

    if (!user) {
      persistDraftForAuthRedirect();
      navigate(ROUTES.register, { state: { returnTo: `${location.pathname}${location.search}` } });
      return;
    }

    try {
      setSubmitting(true);
      const created = await createAppointment({
        doctorId: row.doctorId,
        serviceId,
        appointmentDate: workDate,
        appointmentTime: toHhMmSs(`${appointmentTime}:00`),
        scheduleId: row.scheduleId,
      });
      const createdAppointmentId = created.data?.appointmentId;
      if (createdAppointmentId) {
        try {
          await notifyReceptionistsNewAppointment(createdAppointmentId, workDate, toHhMmSs(`${appointmentTime}:00`));
        } catch {
          // Notification should not block successful booking.
        }
      }
      clearServiceBookingDraft();
      setBookedSuccess(true);
      setSelectedScheduleId(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.toLowerCase().includes('patient') && msg.toLowerCase().includes('not found')) {
        setSubmitError(
          isVi
            ? 'Bạn cần hoàn thiện hồ sơ bệnh nhân trước khi đặt lịch.'
            : 'Please complete your patient profile before booking.',
        );
      } else {
        setSubmitError(msg || (isVi ? 'Đặt lịch thất bại.' : 'Booking failed.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const successMessageVi = 'Đã nhận yêu cầu của bạn, vui lòng chờ xác nhận từ hệ thống';
  const successMessageEn = 'We have received your request; please wait for system confirmation.';

  return (
    <div className="space-y-10">
      {bookedSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm" role="status">
          <p className="text-lg font-bold text-emerald-900">{isVi ? successMessageVi : successMessageEn}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
              to={getServiceDetailRoute(serviceId)}
            >
              {isVi ? '← Về chi tiết dịch vụ' : '← Back to service'}
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border-2 border-blue-700 bg-white px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              onClick={() => {
                setBookedSuccess(false);
                setAppointmentTime(null);
                setSelectedScheduleId(null);
              }}
            >
              {isVi ? 'Đặt lịch khác' : 'Book another'}
            </button>
          </div>
        </div>
      ) : null}

      {!bookedSuccess ? (
        <>
          <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {isVi ? 'Đặt lịch khám' : 'Book an appointment'}
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{serviceName}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isVi
                ? 'Chọn ngày, khung giờ và bác sĩ phù hợp. Bạn có thể đặt lịch sau khi đăng nhập hoặc đăng ký tài khoản.'
                : 'Pick a date, time slot, and doctor. You can complete booking after signing in or registering.'}
            </p>
          </header>

          <section
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="booking-step-time"
          >
            <h3 id="booking-step-time" className="text-lg font-bold text-slate-900">
              <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">
                1
              </span>
              {isVi ? 'Chọn thời gian' : 'Choose time'}
            </h3>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="booking-date">
                  {isVi ? 'Ngày khám' : 'Date'}
                </label>
                <input
                  id="booking-date"
                  type="date"
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-600"
                  min={todayYmdLocal()}
                  value={workDate}
                  onChange={(e) => {
                    setWorkDate(e.target.value);
                    setAppointmentTime(null);
                    setSelectedScheduleId(null);
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="booking-time">
                  {isVi ? 'Khung giờ' : 'Time'}
                </label>
                <input
                  id="booking-time"
                  type="time"
                  step={60}
                  className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-600"
                  value={appointmentTime ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAppointmentTime(v.length > 0 ? v : null);
                    setSelectedScheduleId(null);
                  }}
                  aria-describedby="booking-time-hint"
                />
                <p id="booking-time-hint" className="mt-3 text-xs text-slate-500">
                  {isVi
                    ? 'Chọn cả ngày và khung giờ để hệ thống tải lịch làm việc của bác sĩ.'
                    : 'Pick both date and time to load doctors’ work schedules.'}
                </p>
              </div>
            </div>
          </section>

          <section
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            aria-labelledby="booking-step-doctor"
          >
            <h3 id="booking-step-doctor" className="text-lg font-bold text-slate-900">
              <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">
                2
              </span>
              {isVi ? 'Chọn bác sĩ' : 'Choose a doctor'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {isVi
                ? 'Danh sách chỉ tải sau khi bạn đã chọn ngày và khung giờ.'
                : 'The list loads only after you choose a date and time slot.'}
            </p>

            {!workDate || !appointmentTime ? (
              <p className="mt-6 text-sm text-slate-500">
                {isVi ? 'Hãy chọn ngày và khung giờ ở bước trên.' : 'Please select a date and time slot above.'}
              </p>
            ) : listLoad === 'loading' ? (
              <div className="mt-6 space-y-3" aria-busy="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : listLoad === 'error' ? (
              <p className="mt-6 text-sm text-red-600">{listError}</p>
            ) : schedules.length === 0 ? (
              <p className="mt-6 text-sm text-amber-800">
                {isVi
                  ? 'Không có bác sĩ trong khung giờ này. Chọn giờ hoặc ngày khác.'
                  : 'No doctors for this slot. Try another time or date.'}
              </p>
            ) : (
              <ul className="mt-6 space-y-3" role="radiogroup" aria-label={isVi ? 'Bác sĩ' : 'Doctors'}>
                {schedules.map((s) => {
                  const name =
                    s.doctor?.user?.name?.trim() || (isVi ? `Bác sĩ #${s.doctorId}` : `Doctor #${s.doctorId}`);
                  const spec = s.doctor?.specialization?.trim() ?? '';
                  const open = canSelectScheduleRow(s);
                  const selected = selectedScheduleId === s.scheduleId;
                  const apptStatus = s.appointmentStatus;
                  return (
                    <li key={s.scheduleId}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={!open}
                        onClick={() => open && setSelectedScheduleId(s.scheduleId)}
                        className={`flex w-full flex-col gap-2 rounded-2xl border-2 p-4 text-left transition md:flex-row md:items-center md:justify-between ${
                          !open
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-80'
                            : selected
                              ? 'border-blue-700 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900">{name}</p>
                          {spec ? <p className="mt-1 text-sm text-slate-600">{spec}</p> : null}
                          <Link
                            className="mt-1 inline-flex text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800"
                            to={getDoctorPublicDetailRoute(s.doctorId)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {isVi ? 'Xem chi tiết bác sĩ' : 'View doctor details'}
                          </Link>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {formatScheduleTimeRange(s.startTime, s.endTime, isVi)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-end">
                          {apptStatus === 'Available' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                              <span aria-hidden>🟢</span>
                              {isVi ? 'Còn trống' : 'Available'}
                            </span>
                          ) : apptStatus === 'Unavailable' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                              <span aria-hidden>🔴</span>
                              {isVi ? 'Đã có lịch' : 'Unavailable'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {isVi ? 'Chưa có thông tin slot' : 'Slot status unknown'}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {submitError ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {submitError}{' '}
                {submitError.includes('hồ sơ') || submitError.includes('profile') ? (
                  <Link className="font-bold underline" to={ROUTES.patientProfile}>
                    {isVi ? 'Mở hồ sơ' : 'Open profile'}
                  </Link>
                ) : null}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={submitting || bookedSuccess}
                onClick={handleConfirm}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-blue-700 px-8 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {submitting ? (isVi ? 'Đang gửi...' : 'Submitting...') : isVi ? 'Xác nhận đặt lịch' : 'Confirm booking'}
              </button>
              {!user ? (
                <p className="w-full text-xs text-slate-500 md:w-auto md:self-center mb-0">
                  {isVi
                    ? 'Bạn sẽ được chuyển tới trang đăng ký nếu chưa đăng nhập.'
                    : 'You will be redirected to register if not signed in.'}
                </p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
