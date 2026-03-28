import { PatientProfileForm } from '@/components/patient/PatientProfileForm';
import {
  patientFormDefaultsFromPatient,
  type PatientProfileFormValues,
} from '@/components/patient/patientProfileForm.shared';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  createPatientProfile,
  getMyPatientProfile,
  updatePatientProfile,
  type Patient,
} from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const patientMeQueryKey = ['patients', 'me'] as const;

function AccountSummaryCard({ patient, isVi }: { patient: Patient; isVi: boolean }) {
  const u = patient.user;
  const name = u?.name ?? '—';
  const email = u?.email ?? '—';
  const phone = u?.phone ?? '—';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Tài khoản' : 'Account'}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-slate-500">{isVi ? 'Họ tên' : 'Full name'}</dt>
          <dd className="text-slate-800">{name}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">Email</dt>
          <dd className="text-slate-800">{email}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-500">{isVi ? 'Điện thoại' : 'Phone'}</dt>
          <dd className="text-slate-800">{phone}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-slate-500">
        {isVi
          ? 'Để đổi họ tên hoặc email, vui lòng liên hệ quầy lễ tân hoặc quản trị viên.'
          : 'To change your name or email, please contact reception or an administrator.'}
      </p>
    </div>
  );
}

export function HoSoBenhNhanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Hồ sơ bệnh nhân' : 'NHA KHOA TẬN TÂM | Patient profile');

  const {
    data: patient,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: patientMeQueryKey,
    queryFn: async () => {
      const res = await getMyPatientProfile();
      return res?.data ?? null;
    },
    enabled: !!user && user.roleId === PATIENT_ROLE_ID,
  });

  const createMutation = useMutation({
    mutationFn: (payload: PatientProfileFormValues) =>
      createPatientProfile({
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        address: payload.address.trim() || null,
        medicalHistory: payload.medicalHistory.trim() || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientMeQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ patientId, payload }: { patientId: number; payload: PatientProfileFormValues }) =>
      updatePatientProfile(patientId, {
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        address: payload.address.trim() || null,
        medicalHistory: payload.medicalHistory.trim() || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientMeQueryKey });
    },
  });

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">{isVi ? 'Cần đăng nhập' : 'Sign in required'}</h1>
        <p className="mt-2 text-sm text-slate-700">
          {isVi ? 'Vui lòng đăng nhập để quản lý hồ sơ bệnh nhân.' : 'Please sign in to manage your patient profile.'}
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
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-xl font-bold text-red-900">{isVi ? 'Không tải được hồ sơ' : 'Could not load profile'}</h1>
        <p className="mt-2 text-sm text-red-800">{error instanceof Error ? error.message : 'Error'}</p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-red-700 underline"
          onClick={() => void refetch()}
        >
          {isVi ? 'Thử lại' : 'Try again'}
        </button>
      </section>
    );
  }

  const submitting = createMutation.isPending || updateMutation.isPending;
  const formError =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : updateMutation.error instanceof Error
        ? updateMutation.error.message
        : null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Hồ sơ bệnh nhân' : 'Patient profile'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isVi
            ? 'Cập nhật thông tin y tế và liên hệ phục vụ đặt lịch và điều trị.'
            : 'Keep your medical and contact details up to date for appointments and care.'}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        {patient ? (
          <div className="lg:col-span-2">
            <AccountSummaryCard patient={patient} isVi={isVi} />
          </div>
        ) : null}

        <div className={patient ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              {patient ? (isVi ? 'Chỉnh sửa hồ sơ' : 'Edit profile') : isVi ? 'Tạo hồ sơ mới' : 'Create your profile'}
            </h2>
            {!patient ? (
              <p className="mt-2 text-sm text-slate-600">
                {isVi
                  ? 'Bạn chưa có hồ sơ bệnh nhân. Điền các thông tin bên dưới để tạo hồ sơ.'
                  : 'You do not have a patient profile yet. Fill in the form below to create one.'}
              </p>
            ) : null}

            {formError ? (
              <p
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {formError}
              </p>
            ) : null}

            <div className="mt-6">
              <PatientProfileForm
                key={patient ? `edit-${patient.patientId}` : 'create'}
                defaultValues={
                  patient
                    ? patientFormDefaultsFromPatient(patient)
                    : {
                        dateOfBirth: '',
                        gender: 'Male',
                        address: '',
                        medicalHistory: '',
                      }
                }
                submitLabel={patient ? (isVi ? 'Lưu thay đổi' : 'Save changes') : isVi ? 'Tạo hồ sơ' : 'Create profile'}
                isSubmitting={submitting}
                isVi={isVi}
                onSubmit={async (values) => {
                  if (patient) {
                    await updateMutation.mutateAsync({ patientId: patient.patientId, payload: values });
                  } else {
                    await createMutation.mutateAsync(values);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
