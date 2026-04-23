import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { AccountSummaryCard } from '@/components/patient/AccountSummaryCard';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMe } from '@/services/authService';
import type { Patient } from '@/services/patientService';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function ThongTinCaNhanBacSiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Thông tin cá nhân bác sĩ' : 'NHA KHOA TAN TAM | Doctor profile');

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem thông tin cá nhân.' : 'Please sign in to view your profile.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.DOCTOR.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'}
        action={
          <button type="button" className="text-sm font-semibold text-blue-600 underline" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  const pseudoPatient: Patient = {
    patientId: 0,
    userId: user.userId,
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      avatar: user.avatar,
      status: user.status,
      role: user.role,
    },
    dateOfBirth: '',
    gender: 'Male',
    address: null,
    medicalHistory: null,
    createdAt: user.createdAt,
  };

  return (
    <div className="mx-auto w-full max-w-[1360px]">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Thông tin cá nhân bác sĩ' : 'Doctor account'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isVi
            ? 'Cập nhật thông tin tài khoản bác sĩ đang đăng nhập.'
            : 'Update the account information for the signed-in doctor.'}
        </p>
      </header>

      <PageCard>
        <AccountSummaryCard
          patient={pseudoPatient}
          isVi={isVi}
          onAccountUpdated={() => {
            const token = typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null;
            if (token) {
              void getMe(token).then((res) => {
                if (res?.data) setUser(res.data);
              });
            }
          }}
        />
      </PageCard>
    </div>
  );
}
