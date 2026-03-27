import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { register, requestOtp } from '@/services/authService';
import { type AuthUser, useAuthStore } from '@/stores/authStore';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const navigate = useNavigate();

  const { language } = useLanguage();
  const isVi = language === 'vi';
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đăng ký' : 'NHA KHOA TẬN TÂM | Register');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSubmitting(true);

      const response = await register({
        name,
        email,
        password,
        phone,
        otp,
        roleId: 2,
        avatar,
      });

      // Persist tokens for later authenticated requests.
      window.localStorage.setItem('accessToken', response.data.accessToken);
      window.localStorage.setItem('refreshToken', response.data.refreshToken);

      // Lưu thông tin user vào zustand (đảm bảo shape khớp `AuthUser`).
      const apiUser = response.data.user;
      const roleId = typeof apiUser.roleId === 'string' ? Number(apiUser.roleId) : apiUser.roleId;
      const mappedUser: AuthUser = {
        userId: apiUser.userId,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone,
        roleId,
        role: {
          roleId,
          roleName: apiUser.role?.roleName ?? '',
        },
        avatar: apiUser.avatar ?? '',
        status: apiUser.status,
        createdAt: apiUser.createdAt,
        deletedAt: apiUser.deletedAt,
      };

      setUser(mappedUser);

      setSuccess(isVi ? 'Đăng ký thành công.' : 'Registration successful.');
      navigate(ROUTES.home);
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (isVi ? 'Đang xử lý...' : 'Submitting...') : isVi ? 'Đăng ký' : 'Register'}
        </button>
      </form>

      <p className="mt-5! text-sm text-slate-600">
        {isVi ? 'Bạn đã có tài khoản?' : 'Already have an account?'}{' '}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to={ROUTES.login}>
          {isVi ? 'Đăng nhập' : 'Login'}
        </Link>
      </p>
    </section>
  );
}
