import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { forgotPassword, requestForgotPasswordOtp } from '@/services/authService';
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quên mật khẩu' : 'NHA KHOA TẬN TÂM | Forgot password');

  const handleRequestOtp = async () => {
    setError(null);
    setSuccess(null);

    if (!email) {
      setError(isVi ? 'Vui lòng nhập email để nhận mã OTP.' : 'Please enter your email to receive OTP.');
      return;
    }

    try {
      setIsRequestingOtp(true);
      await requestForgotPasswordOtp({ email });
      setSuccess(isVi ? 'Đã gửi mã OTP đến email của bạn.' : 'OTP has been sent to your email.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : null;
      setError(errorMessage ?? (isVi ? 'Gửi mã OTP thất bại. Vui lòng thử lại.' : 'Failed to send OTP. Please try again.'));
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(isVi ? 'Mật khẩu xác nhận không khớp.' : 'Password confirmation does not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      await forgotPassword({ email, otp, password });
      setSuccess(isVi ? 'Đặt lại mật khẩu thành công.' : 'Password reset successful.');
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : null;
      setError(
        errorMessage ??
          (isVi
            ? 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra email, OTP và mật khẩu mới.'
            : 'Password reset failed. Please check your email, OTP, and new password.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Quên mật khẩu' : 'Forgot password'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi
          ? 'Nhập email để nhận OTP và tạo mật khẩu mới cho tài khoản.'
          : 'Enter your email to receive OTP and create a new password for your account.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="forgot-password-email">
          Email
        </label>
        <div className="flex gap-2">
          <input
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
            id="forgot-password-email"
            name="email"
            placeholder="name@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-800 px-3 text-xs font-bold text-white! transition hover:bg-slate-900! disabled:cursor-not-allowed disabled:bg-slate-400!"
            type="button"
            onClick={handleRequestOtp}
            disabled={isSubmitting || isRequestingOtp}
          >
            {isRequestingOtp ? (isVi ? 'Đang gửi...' : 'Sending...') : isVi ? 'Lấy OTP' : 'Get OTP'}
          </button>
        </div>

        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="forgot-password-otp">
          OTP
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="forgot-password-otp"
          name="otp"
          placeholder="123456"
          type="text"
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          required
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="forgot-password-new-password">
          {isVi ? 'Mật khẩu mới' : 'New password'}
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="forgot-password-new-password"
          name="password"
          placeholder="NewP@ssw0rd123"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="forgot-password-confirm-password">
          {isVi ? 'Xác nhận mật khẩu mới' : 'Confirm new password'}
        </label>
        <input
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600"
          id="forgot-password-confirm-password"
          name="confirmPassword"
          placeholder="NewP@ssw0rd123"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {error ? <p className="mt-2! text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-2! text-sm text-green-600">{success}</p> : null}

        <button
          className="mt-2! inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
          type="submit"
          disabled={isSubmitting || isRequestingOtp}
        >
          {isSubmitting ? (isVi ? 'Đang xử lý...' : 'Submitting...') : isVi ? 'Đặt lại mật khẩu' : 'Reset password'}
        </button>
      </form>

      <p className="mt-5! text-sm text-slate-600">
        {isVi ? 'Đã nhớ mật khẩu?' : 'Remembered your password?'}{' '}
        <Link className="font-semibold text-blue-700 hover:text-blue-800" to={ROUTES.login}>
          {isVi ? 'Đăng nhập' : 'Login'}
        </Link>
      </p>
    </section>
  );
}
