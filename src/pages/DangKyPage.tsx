import { ADMIN_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { register, requestOtp } from '@/services/authService';
import { getRoles, type Role } from '@/services/roleService';
import { type AuthUser, useAuthStore } from '@/stores/authStore';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

type RegisterLocationState = { returnTo?: string };

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as RegisterLocationState | null)?.returnTo;
  const safeReturnTo =
    typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : null;

  const { language } = useLanguage();
  const isVi = language === 'vi';
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState<number | ''>('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [otp, setOtp] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đăng ký' : 'NHA KHOA TẬN TÂM | Register');

  useEffect(() => {
    let isMounted = true;

    const fetchRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await getRoles({ page: 1, limit: 100 });
        const roleItems = response.data.items;

        if (!isMounted) return;

        setRoles(roleItems.filter((item) => ![ADMIN_ROLE_ID].includes(item.roleId)));

        const defaultRole = roleItems.find((role) => role.roleId === 2) ?? roleItems[0];
        setRoleId(defaultRole?.roleId ?? '');
      } catch {
        if (!isMounted) return;
        setError(
          isVi ? 'Không tải được danh sách quyền. Vui lòng thử lại.' : 'Failed to load roles. Please try again.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingRoles(false);
        }
      }
    };

    void fetchRoles();

    return () => {
      isMounted = false;
    };
  }, [isVi]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (roleId === '') {
      setError(isVi ? 'Vui lòng chọn quyền cho tài khoản.' : 'Please choose a role for the account.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await register({
        name,
        email,
        password,
        phone,
        otp,
        roleId,
        avatar,
      });

      // Persist tokens for later authenticated requests.
      window.localStorage.setItem('accessToken', response.data.accessToken);
      window.localStorage.setItem('refreshToken', response.data.refreshToken);

      // Lưu thông tin user vào zustand (đảm bảo shape khớp `AuthUser`).
      const apiUser = response.data.user;
      const userRoleId = typeof apiUser.roleId === 'string' ? Number(apiUser.roleId) : apiUser.roleId;
      const mappedUser: AuthUser = {
        userId: apiUser.userId,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        roleId: userRoleId,
        role: {
          roleId: userRoleId,
          roleName: apiUser.role?.roleName ?? '',
        },
        avatar: apiUser.avatar ?? '',
        status: apiUser.status,
        createdAt: apiUser.createdAt,
        deletedAt: apiUser.deletedAt,
      };

      setUser(mappedUser);

      setSuccess(isVi ? 'Đăng ký thành công.' : 'Registration successful.');
      navigate(safeReturnTo ?? ROUTES.home, { replace: true });
    } catch {
      setError(
        isVi
          ? 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
          : 'Registration failed. Please check your information.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    setError(null);
    setSuccess(null);

    if (!email) {
      setError(isVi ? 'Vui lòng nhập email để nhận mã OTP.' : 'Please enter your email to receive OTP.');
      return;
    }

    try {
      setIsRequestingOtp(true);

      await requestOtp({ email });

      setSuccess(isVi ? 'Đã gửi mã OTP đến email của bạn.' : 'OTP has been sent to your email.');
    } catch {
      setError(isVi ? 'Gửi mã OTP thất bại. Vui lòng thử lại.' : 'Failed to send OTP. Please try again.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Đăng ký' : 'Register'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi ? 'Tạo tài khoản mới với thông tin bên dưới.' : 'Create a new account with the information below.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="register-name">
          {isVi ? 'Họ và tên' : 'Full name'}
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-name"
          name="name"
          placeholder={isVi ? 'Nguyễn Văn A' : 'Full name'}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700 mt-4" htmlFor="register-email">
          Email
        </label>
        <div className="flex gap-2">
          <input
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
            id="register-email"
            name="email"
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button
            type="button"
            className="cursor-pointer inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 px-3 text-xs font-bold text-white! transition hover:bg-slate-900! disabled:cursor-not-allowed disabled:bg-slate-400!"
            onClick={handleRequestOtp}
            disabled={isSubmitting || isRequestingOtp}
          >
            {isRequestingOtp ? (isVi ? 'Đang gửi...' : 'Sending...') : isVi ? 'Lấy mã OTP' : 'Get OTP'}
          </button>
        </div>

        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="register-password">
          Password
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-password"
          name="password"
          placeholder="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700 mt-4" htmlFor="register-phonenumber">
          {isVi ? 'Số điện thoại' : 'Phone number'}
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-phonenumber"
          name="phonenumber"
          placeholder="0901234567"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />

        <label className="mb-1 mt-4 block text-sm font-semibold text-slate-700" htmlFor="register-role">
          {isVi ? 'Quyền tài khoản' : 'Account role'}
        </label>
        <select
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-role"
          name="role"
          value={roleId}
          onChange={(event) => {
            const value = event.target.value;
            setRoleId(value ? Number(value) : '');
          }}
          disabled={isLoadingRoles}
          required
        >
          <option value="" disabled>
            {isLoadingRoles ? (isVi ? 'Đang tải quyền...' : 'Loading roles...') : isVi ? 'Chọn quyền' : 'Select a role'}
          </option>
          {roles.map((role) => (
            <option key={role.roleId} value={role.roleId}>
              {role.roleName}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-semibold text-slate-700 mt-4" htmlFor="register-otp">
          OTP
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-otp"
          name="otp"
          placeholder="123456"
          type="text"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          required
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700 mt-4" htmlFor="register-avatar">
          {isVi ? 'Ảnh đại diện' : 'Avatar'}
        </label>
        <input
          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
          id="register-avatar"
          name="avatar"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setAvatar(file ?? null);
          }}
        />

        {error ? <p className="mt-2! text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-2! text-sm text-green-600">{success}</p> : null}

        <button
          className="mt-2! inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          type="submit"
          disabled={isSubmitting || isLoadingRoles}
        >
          {isSubmitting ? (isVi ? 'Đang xử lý...' : 'Submitting...') : isVi ? 'Đăng ký' : 'Register'}
        </button>
      </form>

      <p className="mt-5! text-sm text-slate-600">
        {isVi ? 'Bạn đã có tài khoản?' : 'Already have an account?'}{' '}
        <Link
          className="font-semibold text-blue-700 hover:text-blue-800"
          to={ROUTES.login}
          state={safeReturnTo ? { returnTo: safeReturnTo } : undefined}
        >
          {isVi ? 'Đăng nhập' : 'Login'}
        </Link>
      </p>
    </section>
  );
}
