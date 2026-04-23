import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { AccountSummaryCard } from '@/components/patient/AccountSummaryCard';
import { PatientProfileForm } from '@/components/patient/PatientProfileForm';
import {
  patientFormDefaultsFromPatient,
  type PatientProfileFormValues,
} from '@/components/patient/patientProfileForm.shared';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMe } from '@/services/authService';
import { createPatientProfile, getMyPatientProfile, updatePatientProfile } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

const patientMeQueryKey = ['patients', 'me'] as const;
const toolbarLinkClassName =
  'inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-bold shadow-sm transition';
const neutralToolbarLinkClassName = `${toolbarLinkClassName} border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-800`;
const successToolbarLinkClassName =
  `${toolbarLinkClassName} border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100`;
const primaryActionClassName =
  'inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white';

export function HoSoBenhNhanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
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
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để quản lý hồ sơ bệnh nhân.' : 'Please sign in to manage your patient profile.'}
        action={
          <button type="button" className={primaryActionClassName} onClick={() => navigate(ROUTES.login)}>
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (user.roleId !== PATIENT_ROLE_ID) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={isVi ? 'Trang này chỉ dành cho tài khoản bệnh nhân.' : 'This page is only available for patient accounts.'}
        action={
          <button type="button" className="text-sm font-semibold text-blue-600 underline" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được hồ sơ' : 'Could not load profile'}
        description={error instanceof Error ? error.message : 'Error'}
        action={
          <button type="button" className="text-sm font-semibold text-red-700 underline" onClick={() => void refetch()}>
            {isVi ? 'Thử lại' : 'Try again'}
          </button>
        }
      />
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
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Hồ sơ bệnh nhân' : 'Patient profile'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Cập nhật thông tin y tế và liên hệ phục vụ đặt lịch và điều trị.'
              : 'Keep your medical and contact details up to date for appointments and care.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <Link
            to={ROUTES.patientAppointments}
            className={neutralToolbarLinkClassName}
          >
            {isVi ? 'Lịch hẹn của tôi →' : 'My appointments →'}
          </Link>
          <Link
            to={ROUTES.patientMedicalRecords}
            className={successToolbarLinkClassName}
          >
            {isVi ? 'Bệnh án →' : 'Medical records →'}
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        {patient ? (
          <div className="lg:col-span-2">
            <AccountSummaryCard
              patient={patient}
              isVi={isVi}
              onAccountUpdated={() => {
                void queryClient.invalidateQueries({ queryKey: patientMeQueryKey });
                const token = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
                if (token) {
                  void getMe(token).then((res) => {
                    if (res?.data) setUser(res.data);
                  });
                }
              }}
            />
          </div>
        ) : null}

        <div className={patient ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <PageCard>
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
          </PageCard>
        </div>
      </div>
    </div>
  );
}
