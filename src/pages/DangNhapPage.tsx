import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function LoginPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đăng nhập' : 'NHA KHOA TẬN TÂM | Login');

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Đăng nhập' : 'Login'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi ? 'Nhập thông tin tài khoản của bạn để tiếp tục.' : 'Enter your account information to continue.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="login-username">
          Username
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="login-username"
          name="username"
          placeholder="username"
          type="text"
        />

        <label className="block text-sm font-semibold text-slate-700" htmlFor="login-password">
          Password
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="login-password"
          name="password"
          placeholder="password"
          type="password"
        />

        <button className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800" type="submit">
          {isVi ? 'Đăng nhập' : 'Login'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        {isVi ? 'Bạn chưa có tài khoản?' : "Don't have an account?"}{' '}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to={ROUTES.register}>
          {isVi ? 'Đăng ký ngay' : 'Sign up now'}
        </Link>
      </p>
    </section>
  );
}
