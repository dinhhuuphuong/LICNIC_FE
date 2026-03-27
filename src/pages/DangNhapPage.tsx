import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { login } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đăng nhập' : 'NHA KHOA TẬN TÂM | Login');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSubmitting(true);

      const response = await login({ email, password });

      // Persist tokens for later authenticated requests.
      window.localStorage.setItem('accessToken', response.data.accessToken);
      window.localStorage.setItem('refreshToken', response.data.refreshToken);

      // Lưu thông tin user vào zustand (đồng thời có persist).
      setUser(response.data.user);

      setSuccess(isVi ? 'Đăng nhập thành công.' : 'Login successful.');
      navigate(ROUTES.home);
    } catch {
      setError(
        isVi
          ? 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'
          : 'Login failed. Please check your email and password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Đăng nhập' : 'Login'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi ? 'Nhập thông tin tài khoản của bạn để tiếp tục.' : 'Enter your account information to continue.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="mb-2! block text-sm font-semibold text-slate-700" htmlFor="login-email">
          {isVi ? 'Email' : 'Email'}
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="login-email"
          name="email"
          placeholder="name@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label className="mb-2! block text-sm font-semibold text-slate-700 mt-4" htmlFor="login-password">
          {isVi ? 'Mật khẩu' : 'Password'}
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="login-password"
          name="password"
          placeholder="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p className="mt-2! text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-2! text-sm text-green-600">{success}</p> : null}

        <button
          className="mt-2! inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          type="submit"
          disabled={isSubmitting}
        >
          {isVi ? 'Đăng nhập' : 'Login'}
        </button>
      </form>

      <p className="mt-5! text-sm text-slate-600">
        {isVi ? 'Bạn chưa có tài khoản?' : "Don't have an account?"}{' '}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to={ROUTES.register}>
          {isVi ? 'Đăng ký ngay' : 'Sign up now'}
        </Link>
      </p>
    </section>
  );
}
