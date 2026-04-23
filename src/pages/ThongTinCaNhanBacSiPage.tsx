import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { DoctorProfileForm, type DoctorProfileFormValues } from '@/components/doctor/DoctorProfileForm';
import { AccountSummaryCard } from '@/components/patient/AccountSummaryCard';
import { DOCTOR_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMe } from '@/services/authService';
import {
  createMyDoctorProfile,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  type Doctor,
  type DoctorUser,
} from '@/services/doctorService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const doctorMeQueryKey = ['doctors', 'me'] as const;
const toolbarLinkClassName =
  'inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-bold shadow-sm transition';
const neutralToolbarLinkClassName = `${toolbarLinkClassName} border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-800`;
const primaryActionClassName =
  'inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white';

const emptyDoctorProfileFormValues: DoctorProfileFormValues = {
  specialization: '',
  experienceYears: '',
  consultationFee: '',
  description: '',
};

function doctorProfileFormDefaultsFromDoctor(doctor: Doctor): DoctorProfileFormValues {
  return {
    specialization: doctor.specialization ?? '',
    experienceYears: String(doctor.experienceYears ?? ''),
    consultationFee: String(Math.trunc(Number.parseFloat(doctor.consultationFee || '0') || 0)),
    description: doctor.description ?? '',
  };
}

function doctorUserToPseudoPatient(doctorUser: DoctorUser | null) {
  if (!doctorUser) return null;
  return {
    patientId: 0,
    userId: doctorUser.userId,
    user: {
      userId: doctorUser.userId,
      name: doctorUser.name,
      email: doctorUser.email,
      phone: doctorUser.phone,
      roleId: doctorUser.roleId,
      avatar: doctorUser.avatar,
      status: doctorUser.status,
    },
    dateOfBirth: '',
    gender: 'Male' as const,
    address: null,
    medicalHistory: null,
    createdAt: doctorUser.createdAt,
  };
}

export function ThongTinCaNhanBacSiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Thông tin cá nhân bác sĩ' : 'NHA KHOA TAN TAM | Doctor profile');

  const {
    data: doctor,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: doctorMeQueryKey,
    queryFn: async () => {
      const res = await getMyDoctorProfile();
      return res?.data ?? null;
    },
    enabled: !!user && user.roleId === DOCTOR_ROLE_ID,
  });

  const createMutation = useMutation({
    mutationFn: (payload: DoctorProfileFormValues) =>
      createMyDoctorProfile({
        specialization: payload.specialization.trim(),
        experienceYears: Number.parseInt(payload.experienceYears, 10),
        consultationFee: Number.parseInt(payload.consultationFee, 10),
        description: payload.description.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorMeQueryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: DoctorProfileFormValues) =>
      updateMyDoctorProfile({
        specialization: payload.specialization.trim(),
        experienceYears: Number.parseInt(payload.experienceYears, 10),
        consultationFee: Number.parseInt(payload.consultationFee, 10),
        description: payload.description.trim(),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorMeQueryKey });
    },
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem thông tin cá nhân.' : 'Please sign in to view your profile.'}
        action={
          <button type="button" className={primaryActionClassName} onClick={() => navigate(ROUTES.login)}>
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (user.roleId !== DOCTOR_ROLE_ID) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
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

  const pseudoPatient = doctorUserToPseudoPatient(doctor?.user ?? user);
  const submitting = createMutation.isPending || updateMutation.isPending;
  const formError =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : updateMutation.error instanceof Error
        ? updateMutation.error.message
        : null;

  const handleProfileSubmit = async (values: DoctorProfileFormValues) => {
    if (doctor) {
      await updateMutation.mutateAsync(values, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: doctorMeQueryKey });
          message.success(isVi ? 'Đã cập nhật hồ sơ' : 'Profile updated');
        },
        onError: (error) => {
          message.error(
            error instanceof Error ? error.message : isVi ? 'Cập nhật hồ sơ thất bại' : 'Update profile failed',
          );
        },
      });
      return;
    }
    await createMutation.mutateAsync(values);
  };

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Thông tin cá nhân bác sĩ' : 'Doctor profile'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Quản lý thông tin chuyên môn và phí tư vấn hiển thị trên hồ sơ bác sĩ.'
              : 'Manage your professional details and consultation fee shown on your doctor profile.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          <Link to={ROUTES.doctorWorkSchedules} className={neutralToolbarLinkClassName}>
            {isVi ? 'Lịch làm việc của tôi →' : 'My work schedules →'}
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        {pseudoPatient ? (
          <div className="lg:col-span-2">
            <AccountSummaryCard
              patient={pseudoPatient}
              isVi={isVi}
              onAccountUpdated={() => {
                void queryClient.invalidateQueries({ queryKey: doctorMeQueryKey });
                message.success(isVi ? 'Đã cập nhật hồ sơ' : 'Profile updated');

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

        <div className={pseudoPatient ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <PageCard>
            <h2 className="text-lg font-bold text-slate-900">
              {doctor
                ? isVi
                  ? 'Chỉnh sửa hồ sơ bác sĩ'
                  : 'Edit doctor profile'
                : isVi
                  ? 'Tạo hồ sơ bác sĩ'
                  : 'Create doctor profile'}
            </h2>
            {!doctor ? (
              <p className="mt-2 text-sm text-slate-600">
                {isVi
                  ? 'Bạn chưa có hồ sơ bác sĩ. Điền đầy đủ thông tin bên dưới để tạo hồ sơ.'
                  : 'You do not have a doctor profile yet. Fill in the form below to create one.'}
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

            <DoctorProfileForm
              key={doctor ? `edit-${doctor.doctorId}` : 'create'}
              defaultValues={doctor ? doctorProfileFormDefaultsFromDoctor(doctor) : emptyDoctorProfileFormValues}
              submitLabel={doctor ? (isVi ? 'Lưu thay đổi' : 'Save changes') : isVi ? 'Tạo hồ sơ' : 'Create profile'}
              isSubmitting={submitting}
              isVi={isVi}
              onSubmit={handleProfileSubmit}
            />
          </PageCard>
        </div>
      </div>
    </div>
  );
}
