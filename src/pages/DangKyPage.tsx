import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function RegisterPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đăng ký' : 'NHA KHOA TẬN TÂM | Register');

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Đăng ký' : 'Register'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi ? 'Tạo tài khoản mới với thông tin bên dưới.' : 'Create a new account with the information below.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-username">
          Username
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-username"
          name="username"
          placeholder="username"
          type="text"
        />

        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-email">
          Email
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-email"
          name="email"
          placeholder="name@example.com"
          type="email"
        />

        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-password">
          Password
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-password"
          name="password"
          placeholder="password"
          type="password"
        />

        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-phonenumber">
          PhoneNumber
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="register-phonenumber"
          name="phonenumber"
          placeholder="0123456789"
          type="tel"
        />

        <button className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800" type="submit">
          {isVi ? 'Đăng ký' : 'Register'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        {isVi ? 'Bạn đã có tài khoản?' : 'Already have an account?'}{' '}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to={ROUTES.login}>
          {isVi ? 'Đăng nhập' : 'Login'}
        </Link>
      </p>
    </section>
  );
}
