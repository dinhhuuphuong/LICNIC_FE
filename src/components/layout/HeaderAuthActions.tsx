import ROLE from '@/constants/role';
import { PATIENT_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type HeaderAuthActionsProps = {
  loginLabel: string;
  registerLabel: string;
};

const DEFAULT_AVATAR_URL = '/imgs/default-avatar.jpg';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

export function HeaderAuthActions({ loginLabel, registerLabel }: HeaderAuthActionsProps) {
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const normalizedRoleName = normalizeRoleName(user?.role?.roleName);
  const isAdminRole = normalizedRoleName === ROLE.ADMIN.toLowerCase();
  const isDoctorRole = normalizedRoleName === ROLE.DOCTOR.toLowerCase();
  const isPatientRole = normalizedRoleName === ROLE.PATIENT.toLowerCase() || user?.roleId === PATIENT_ROLE_ID;
  const isReceptionistRole = normalizedRoleName === ROLE.RECEPTIONIST.toLowerCase();

  const initialAvatarSrc = useMemo(() => {
    if (!user?.avatar) return DEFAULT_AVATAR_URL;
    return user.avatar;
  }, [user?.avatar]);

  const [avatarSrc, setAvatarSrc] = useState(initialAvatarSrc);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsPopoverOpen(false);
  }, [user]);

  useEffect(() => {
    setAvatarSrc(initialAvatarSrc);
  }, [initialAvatarSrc]);

  useEffect(() => {
    if (!isPopoverOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node | null;
      if (!target) return;

      if (!containerRef.current.contains(target)) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [isPopoverOpen]);

  const logoutLabel = language === 'vi' ? 'Đăng xuất' : 'Logout';
  const homeLabel = language === 'vi' ? 'Trang chủ' : 'Home';
  const adminLabel = language === 'vi' ? 'Quản trị' : 'Admin';
  const profileLabel = language === 'vi' ? 'Hồ sơ bệnh nhân' : 'My profile';
  const appointmentsLabel = language === 'vi' ? 'Lịch hẹn' : 'Appointments';
  const medicalRecordsLabel = language === 'vi' ? 'Bệnh án' : 'Medical records';
  const doctorProfileLabel = language === 'vi' ? 'Thông tin cá nhân' : 'Profile';
  const doctorSchedulesLabel = language === 'vi' ? 'Lịch làm việc' : 'Work schedules';
  const doctorAppointmentsLabel = language === 'vi' ? 'Quản lý đặt lịch' : 'Appointment management';
  const receptionistAppointmentsLabel = language === 'vi' ? 'Quản lý đặt lịch' : 'Appointment management';
  const receptionistPaymentsLabel = language === 'vi' ? 'Quản lý thanh toán' : 'Payment management';
  const receptionistCustomerCareLabel = language === 'vi' ? 'Chăm sóc khách hàng' : 'Customer care';

  const handleLogout = () => {
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('refreshToken');
    clearUser();
    setIsPopoverOpen(false);
    navigate(ROUTES.login);
  };

  if (!user) {
    return (
      <>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full border border-sky-200 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow"
          to={ROUTES.login}
        >
          {loginLabel}
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full border border-blue-200 bg-linear-to-b from-blue-50 to-blue-100 px-5 text-sm font-bold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:from-blue-100 hover:to-blue-200 hover:shadow"
          to={ROUTES.register}
        >
          {registerLabel}
        </Link>
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
        type="button"
        aria-label={user.name}
        aria-expanded={isPopoverOpen}
        onClick={() => setIsPopoverOpen((value) => !value)}
        title={user.name}
      >
        <img
          className="h-10 w-10 shrink-0 rounded-full object-cover"
          src={avatarSrc}
          alt={user.name}
          onError={() => setAvatarSrc(DEFAULT_AVATAR_URL)}
        />
      </button>

      {isPopoverOpen ? (
        <div
          className="absolute right-0 top-full z-20 mt-2 min-w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
          role="menu"
          aria-label="User menu"
          onClick={(event) => event.stopPropagation()}
        >
          <Link
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            to={ROUTES.home}
            role="menuitem"
            onClick={() => setIsPopoverOpen(false)}
          >
            {homeLabel}
          </Link>

          {isPatientRole && (
            <>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.patientProfile}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {profileLabel}
              </Link>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.patientAppointments}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {appointmentsLabel}
              </Link>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.patientMedicalRecords}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {medicalRecordsLabel}
              </Link>
            </>
          )}

          {isAdminRole && (
            <Link
              className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              to={ROUTES.admin}
              role="menuitem"
              onClick={() => setIsPopoverOpen(false)}
            >
              {adminLabel}
            </Link>
          )}

          {isDoctorRole && (
            <>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.doctorProfile}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {doctorProfileLabel}
              </Link>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.doctorWorkSchedules}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {doctorSchedulesLabel}
              </Link>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.doctorAppointments}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {doctorAppointmentsLabel}
              </Link>
            </>
          )}

          {isReceptionistRole && (
            <>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.receptionistAppointments}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {receptionistAppointmentsLabel}
              </Link>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.receptionistPaymentsManage}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {receptionistPaymentsLabel}
              </Link>
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to={ROUTES.receptionistCustomerCare}
                role="menuitem"
                onClick={() => setIsPopoverOpen(false)}
              >
                {receptionistCustomerCareLabel}
              </Link>
            </>
          )}

          <button
            className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            type="button"
            role="menuitem"
            onClick={handleLogout}
          >
            {logoutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
