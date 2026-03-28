import { PatientMedicalRecordCard } from '@/components/patient/PatientMedicalRecordCard';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { listMyMedicalRecords } from '@/services/medicalRecordService';
import { getMyPatientProfile } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PAGE_SIZE = 8;

const medicalRecordsQueryRoot = ['medical-records', 'patient', 'me'] as const;
const patientMeQueryKey = ['patients', 'me'] as const;

export function BenhAnBenhNhanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [page, setPage] = useState(1);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Hồ sơ bệnh án' : 'NHA KHOA TẬN TÂM | Medical records');

  const {
    data: patient,
    isLoading: isPatientLoading,
    isError: isPatientError,
    error: patientError,
    refetch: refetchPatient,
  } = useQuery({
    queryKey: patientMeQueryKey,
    queryFn: async () => {
      const res = await getMyPatientProfile();
      return res?.data ?? null;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID,
  });

  const queryKey = useMemo(() => [...medicalRecordsQueryRoot, page] as const, [page]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await listMyMedicalRecords({ page, limit: PAGE_SIZE });
      return res.data;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID && patient != null,
  });

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-[1360px] rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">{isVi ? 'Cần đăng nhập' : 'Sign in required'}</h1>
        <p className="mt-2 text-sm text-slate-700">
          {isVi ? 'Vui lòng đăng nhập để xem hồ sơ bệnh án.' : 'Please sign in to view your medical records.'}
        </p>
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
        <p className="mt-2 text-sm text-slate-600">
          {isVi ? 'Trang này chỉ dành cho tài khoản bệnh nhân.' : 'This page is only available for patient accounts.'}
        </p>
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

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const listLoading = isPatientLoading || (patient != null && (isLoading || isFetching));

  if (isPatientError) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h2 className="text-lg font-bold text-red-900">{isVi ? 'Không tải được hồ sơ' : 'Could not load profile'}</h2>
        <p className="mt-2 text-sm text-red-800">{patientError instanceof Error ? patientError.message : 'Error'}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-red-700 underline"
          onClick={() => void refetchPatient()}
        >
          {isVi ? 'Thử lại' : 'Try again'}
        </button>
      </section>
    );
  }

  if (!isPatientLoading && patient == null) {
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Hồ sơ bệnh án' : 'Medical records'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Cần có hồ sơ bệnh nhân để xem bệnh án theo tài khoản của bạn.'
              : 'You need a patient profile to view medical records linked to your account.'}
          </p>
        </header>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-slate-800">
            {isVi ? 'Bạn chưa tạo hồ sơ bệnh nhân.' : 'You have not created a patient profile yet.'}
          </p>
          <Link
            to={ROUTES.patientProfile}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
          >
            {isVi ? 'Tạo / mở hồ sơ' : 'Create or open profile'}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Hồ sơ bệnh án' : 'Medical records'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Theo dõi chẩn đoán, điều trị và đơn thuốc sau mỗi lần khám.'
              : 'Review diagnosis, treatment, and prescriptions from each visit.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <Link
            to={ROUTES.patientAppointments}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-800"
          >
            {isVi ? 'Lịch hẹn →' : 'Appointments →'}
          </Link>
          <Link
            to={ROUTES.patientProfile}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-800"
          >
            {isVi ? 'Hồ sơ BN →' : 'Profile →'}
          </Link>
        </div>
      </header>

      {listLoading ? (
        <div className="space-y-4" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-8">
          <h2 className="text-lg font-bold text-red-900">
            {isVi ? 'Không tải được danh sách' : 'Could not load list'}
          </h2>
          <p className="mt-2 text-sm text-red-800">{error instanceof Error ? error.message : 'Error'}</p>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-red-700 underline"
            onClick={() => void refetch()}
          >
            {isVi ? 'Thử lại' : 'Try again'}
          </button>
        </section>
      ) : !data?.items.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-slate-700">{isVi ? 'Chưa có bệnh án nào được lưu.' : 'No medical records yet.'}</p>
          <p className="mt-2 text-sm text-slate-500">
            {isVi
              ? 'Sau khi khám, phòng khám sẽ cập nhật vào hệ thống.'
              : 'Records will appear here after your visits.'}
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {data.items.map((record) => (
              <li key={record.recordId}>
                <PatientMedicalRecordCard record={record} isVi={isVi} />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
              aria-label={isVi ? 'Phân trang' : 'Pagination'}
            >
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {isVi ? 'Trước' : 'Prev'}
              </button>
              <span className="px-2 text-sm text-slate-600">
                {isVi ? 'Trang' : 'Page'} {page} / {totalPages}
              </span>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {isVi ? 'Sau' : 'Next'}
              </button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
