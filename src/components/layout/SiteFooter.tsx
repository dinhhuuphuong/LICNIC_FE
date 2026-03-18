import { useLanguage } from '@/contexts/NgonNguContext';

export function SiteFooter() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-4 py-4 text-sm text-slate-500">
        <p>{language === 'vi' ? 'Nha khoa Tâm Đức Smile' : 'Tam Duc Smile Dental Clinic'}</p>
        <p>(c) {currentYear}</p>
      </div>
    </footer>
  );
}
