import { appointmentDoctorIdAsNumber } from '@/components/patient/patientAppointments.shared';
import { updateAppointment, type AppointmentListItem } from '@/services/appointmentService';
import { getDoctorWorkSchedulesFromStore, type DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import { toHhMmSs } from '@/utils/bookingTime';
import { useCallback, useEffect, useState } from 'react';

type PatientRescheduleModalProps = {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentListItem | null;
  isVi: boolean;
  onSuccess: () => void;
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

export function PatientRescheduleModal({ open, onClose, appointment, isVi, onSuccess }: PatientRescheduleModalProps) {
  const [workDate, setWorkDate] = useState(todayYmdLocal);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<DoctorWorkSchedule[]>([]);
  const [listLoad, setListLoad] = useState<'idle' | 'loading' | 'error'>('idle');
  const [listError, setListError] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForAppointment = useCallback((appt: AppointmentListItem | null) => {
    if (!appt) return;
    setWorkDate(appt.appointmentDate >= todayYmdLocal() ? appt.appointmentDate : todayYmdLocal());
    const t = appt.appointmentTime.length >= 5 ? appt.appointmentTime.slice(0, 5) : appt.appointmentTime;
    setAppointmentTime(t || null);
    setSelectedScheduleId(null);
    setSchedules([]);
    setListLoad('idle');
    setListError(null);
    setNote(appt.note?.trim() ?? '');
    setSubmitError(null);
  }, []);

  useEffect(() => {
    if (open && appointment) {
      resetForAppointment(appointment);
    }
  }, [open, appointment, resetForAppointment]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const targetDoctorId = appointment ? appointmentDoctorIdAsNumber(appointment) : 0;
  const serviceId = appointment?.serviceId ?? 0;

  useEffect(() => {
    if (!open || !appointment || !workDate || !appointmentTime || !serviceId) {
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
        const rows = res.data.items.filter((s) => s.doctorId === targetDoctorId);
        setSchedules(rows);
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
  }, [appointment, appointmentTime, isVi, open, serviceId, targetDoctorId, workDate]);

  const isSlotAvailableForBooking = (s: DoctorWorkSchedule) => s.status === 'approved';
  const canSelectScheduleRow = (s: DoctorWorkSchedule) =>
    isSlotAvailableForBooking(s) && s.appointmentStatus !== 'Unavailable';

  const handleSubmit = async () => {
    if (!appointment) return;
    setSubmitError(null);
    if (!appointmentTime || selectedScheduleId == null) {
      setSubmitError(isVi ? 'Vui lòng chọn đủ ngày, giờ và ca làm việc.' : 'Please select date, time, and schedule.');
      return;
    }
    const row = schedules.find((s) => s.scheduleId === selectedScheduleId);
    if (!row || !canSelectScheduleRow(row)) {
      setSubmitError(isVi ? 'Khung giờ không hợp lệ.' : 'Invalid time slot.');
      return;
    }
    try {
      setSubmitting(true);
      await updateAppointment(appointment.appointmentId, {
        appointmentDate: workDate,
        appointmentTime: toHhMmSs(`${appointmentTime}:00`),
        scheduleId: row.scheduleId,
        doctorId: row.doctorId,
        serviceId: appointment.serviceId,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      onSuccess();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSubmitError(msg || (isVi ? 'Đổi lịch thất bại.' : 'Reschedule failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !appointment) return null;

  const titleId = 'reschedule-appt-dialog-title';

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-slate-900/55 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-black text-slate-900">
            {isVi ? 'Đổi lịch hẹn' : 'Reschedule appointment'}
          </h2>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            onClick={onClose}
            aria-label={isVi ? 'Đóng' : 'Close'}
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {appointment.serviceName}
          {isVi ? ' — Bác sĩ ' : ' — Dr. '}
          {appointment.doctorName}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {isVi
            ? 'Chỉ hiển thị ca làm việc của đúng bác sĩ đã đặt. Chọn ngày và giờ mới, sau đó chọn ca phù hợp.'
            : 'Only shifts for your current doctor are shown. Pick a new date and time, then confirm the slot.'}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="reschedule-date">
              {isVi ? 'Ngày khám' : 'Date'}
            </label>
            <input
              id="reschedule-date"
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
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="reschedule-time">
              {isVi ? 'Khung giờ' : 'Time'}
            </label>
            <input
              id="reschedule-time"
              type="time"
              step={60}
              className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-blue-600"
              value={appointmentTime ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                setAppointmentTime(v.length > 0 ? v : null);
                setSelectedScheduleId(null);
              }}
            />
          </div>
        </div>

        <div className="mt-4">
          {!workDate || !appointmentTime ? (
            <p className="text-sm text-slate-500">
              {isVi ? 'Chọn ngày và giờ để tải ca làm việc.' : 'Select date and time to load shifts.'}
            </p>
          ) : listLoad === 'loading' ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : listLoad === 'error' ? (
            <p className="text-sm text-red-600">{listError}</p>
          ) : schedules.length === 0 ? (
            <p className="text-sm text-amber-800">
              {isVi
                ? 'Không có ca làm việc phù hợp. Thử giờ hoặc ngày khác.'
                : 'No matching shift. Try another time or date.'}
            </p>
          ) : (
            <ul className="space-y-2" role="radiogroup" aria-label={isVi ? 'Ca làm việc' : 'Shifts'}>
              {schedules.map((s) => {
                const open = canSelectScheduleRow(s);
                const selected = selectedScheduleId === s.scheduleId;
                return (
                  <li key={s.scheduleId}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={!open}
                      onClick={() => open && setSelectedScheduleId(s.scheduleId)}
                      className={`flex w-full flex-col rounded-xl border-2 p-3 text-left text-sm transition ${
                        !open
                          ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-80'
                          : selected
                            ? 'border-blue-700 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900">
                        {formatScheduleTimeRange(s.startTime, s.endTime, isVi)}
                      </span>
                      <span className="mt-1 text-xs text-slate-600">
                        {s.appointmentStatus === 'Unavailable'
                          ? isVi
                            ? 'Đã có lịch'
                            : 'Unavailable'
                          : isVi
                            ? 'Có thể chọn'
                            : 'Selectable'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="reschedule-note">
            {isVi ? 'Ghi chú (tùy chọn)' : 'Note (optional)'}
          </label>
          <textarea
            id="reschedule-note"
            rows={2}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {submitError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? (isVi ? 'Đang lưu...' : 'Saving...') : isVi ? 'Lưu lịch mới' : 'Save new time'}
          </button>
        </div>
      </div>
    </div>
  );
}
