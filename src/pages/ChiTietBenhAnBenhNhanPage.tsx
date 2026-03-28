import { PatientPrescriptionList } from '@/components/patient/PatientPrescriptionList';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMyMedicalRecord } from '@/services/medicalRecordService';
import { getMyPatientProfile } from '@/services/patientService';
import { listPrescriptionsForMyRecord } from '@/services/prescriptionService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const RX_PAGE_SIZE = 50;
const patientMeQueryKey = ['patients', 'me'] as const;

function formatLongDate(iso: string | undefined, isVi: boolean): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return iso;
  }
}

export function ChiTietBenhAnBenhNhanPage() {
  const { recordId: recordIdParam } = useParams<{ recordId: string }>();
  const recordId = Number(recordIdParam);
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const validId = Number.isFinite(recordId) && recordId > 0;

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Chi tiết bệnh án' : 'NHA KHOA TẬN TÂM | Medical record detail');

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: patientMeQueryKey,
    queryFn: async () => {
      const res = await getMyPatientProfile();
      return res?.data ?? null;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID,
  });

  const recordQueryKey = useMemo(() => ['medical-records', 'patient', 'me', recordId] as const, [recordId]);

  const {
    data: recordRes,
    isLoading: isRecordLoading,
    isError: isRecordError,
    error: recordError,
    refetch: refetchRecord,
  } = useQuery({
    queryKey: recordQueryKey,
    queryFn: async () => {
      const res = await getMyMedicalRecord(recordId);
      return res.data;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID && patient != null && validId,
  });

  const rxQueryKey = useMemo(() => ['prescriptions', 'patient', 'me', 'record', recordId] as const, [recordId]);

  const {
    data: rxData,
    isLoading: isRxLoading,
    isError: isRxError,
    error: rxError,
    refetch: refetchRx,
  } = useQuery({
    queryKey: rxQueryKey,
    queryFn: async () => {
      const res = await listPrescriptionsForMyRecord({
        recordId,
        page: 1,
        limit: RX_PAGE_SIZE,
      });
      return res.data;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID && patient != null && validId && !!recordRes,
  });

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-[1360px] rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">{isVi ? 'Cần đăng nhập' : 'Sign in required'}</h1>
        <button
          type="button"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
          onClick={() => navigate(ROUTES.login)}
        >
          {isVi ? 'Đăng nhập' : 'Login'}
        </button>
      </section>
    );
  }

  if (user.roleId !== PATIENT_ROLE_ID) {
    return (
      <section className="mx-auto w-full max-w-[1360px] rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{isVi ? 'Không có quyền truy cập' : 'Access denied'}</h1>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-blue-600 underline"
          onClick={() => navigate(ROUTES.home)}
        >
          {isVi ? 'Về trang chủ' : 'Back to home'}
        </button>
      </section>
    );
  }

  if (!validId) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="font-semibold text-slate-800">{isVi ? 'Mã bệnh án không hợp lệ.' : 'Invalid record id.'}</p>
        <Link to={ROUTES.patientMedicalRecords} className="mt-4 inline-block text-sm font-bold text-blue-700 underline">
          {isVi ? '← Về danh sách' : '← Back to list'}
        </Link>
      </section>
    );
  }

  if (!isPatientLoading && patient == null) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-slate-800">{isVi ? 'Cần hồ sơ bệnh nhân để xem chi tiết.' : 'Patient profile required.'}</p>
        <Link
          to={ROUTES.patientProfile}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
        >
          {isVi ? 'Mở hồ sơ' : 'Open profile'}
        </Link>
      </section>
    );
  }

  const doctorName = recordRes?.doctor?.user?.name?.trim() || (isVi ? '—' : '—');
  const visitDate = formatLongDate(recordRes?.appointment?.appointmentDate ?? recordRes?.createdAt, isVi);
  const visitTime =
    recordRes?.appointment?.appointmentTime && recordRes.appointment.appointmentTime.length >= 5
      ? recordRes.appointment.appointmentTime.slice(0, 5)
      : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          to={ROUTES.patientMedicalRecords}
          className="text-sm font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
        >
          {isVi ? '← Tất cả bệnh án' : '← All records'}
        </Link>
      </div>

      {isRecordLoading || isPatientLoading ? (
        <div className="space-y-4 animate-pulse" aria-busy="true">
          <div className="h-12 w-2/3 rounded-lg bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-100" />
          <div className="h-40 rounded-2xl bg-slate-100" />
        </div>
      ) : isRecordError ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-lg font-bold text-red-900">
            {isVi ? 'Không tải được bệnh án' : 'Could not load record'}
          </h1>
          <p className="mt-2 text-sm text-red-800">{recordError instanceof Error ? recordError.message : 'Error'}</p>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-red-700 underline"
            onClick={() => void refetchRecord()}
          >
            {isVi ? 'Thử lại' : 'Try again'}
          </button>
        </section>
      ) : recordRes ? (
        <>
          <header className="mb-8 border-b border-slate-200 pb-6">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              {isVi ? 'Hồ sơ bệnh án' : 'Medical record'}
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {visitDate}
              {visitTime ? (
                <span className="ml-2 text-xl font-bold text-slate-600">
                  {isVi ? 'lúc' : 'at'} {visitTime}
                </span>
              ) : null}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isVi ? 'Bác sĩ điều trị:' : 'Treating doctor:'}{' '}
              <span className="font-semibold text-slate-800">{doctorName}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {isVi ? 'Mã hồ sơ:' : 'Record id:'} <span className="font-mono">{recordRes.recordId}</span>
              {' · '}
              {isVi ? 'Mã lịch hẹn:' : 'Appointment id:'} <span className="font-mono">{recordRes.appointmentId}</span>
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-1">
            <section
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              aria-labelledby="dx-heading"
            >
              <h2 id="dx-heading" className="text-lg font-bold text-slate-900">
                {isVi ? 'Chẩn đoán' : 'Diagnosis'}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{recordRes.diagnosis}</p>
            </section>

            <section
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              aria-labelledby="tx-heading"
            >
              <h2 id="tx-heading" className="text-lg font-bold text-slate-900">
                {isVi ? 'Điều trị' : 'Treatment'}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{recordRes.treatment}</p>
            </section>

            {recordRes.note ? (
              <section
                className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6"
                aria-labelledby="note-heading"
              >
                <h2 id="note-heading" className="text-lg font-bold text-amber-950">
                  {isVi ? 'Ghi chú' : 'Notes'}
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-950/90">{recordRes.note}</p>
              </section>
            ) : null}

            <section
              className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
              aria-labelledby="rx-heading"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 id="rx-heading" className="text-lg font-bold text-slate-900">
                  {isVi ? 'Chi tiết đơn thuốc' : 'Prescription details'}
                </h2>
                {isRxError ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-700 underline"
                    onClick={() => void refetchRx()}
                  >
                    {isVi ? 'Tải lại thuốc' : 'Reload medicines'}
                  </button>
                ) : null}
              </div>
              {isRxLoading ? (
                <div className="h-32 animate-pulse rounded-xl bg-slate-100" aria-busy="true" />
              ) : isRxError ? (
                <p className="text-sm text-red-800" role="alert">
                  {rxError instanceof Error ? rxError.message : 'Error'}
                </p>
              ) : (
                <PatientPrescriptionList items={rxData?.items ?? []} isVi={isVi} />
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
