import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';

export function NotFoundPage() {
  const { language } = useLanguage();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 md:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-4xl font-black text-slate-900">404</h1>
        <p className="mt-3 text-sm text-slate-600">
          {language === 'vi' ? 'Trang bạn tìm không tồn tại.' : 'The page you are looking for does not exist.'}
        </p>
        <Link className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:text-sky-800" to={ROUTES.home}>
          {language === 'vi' ? 'Quay về trang chủ' : 'Back to home'}
        </Link>
      </div>
    </section>
  );
}
