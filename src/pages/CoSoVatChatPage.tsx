import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function AboutFacilitiesPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Cơ sở vật chất' : 'NHA KHOA TẬN TÂM | Facilities');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Cơ sở vật chất' : 'Facilities'}
        description={
          isVi
            ? 'Khám phá không gian phòng khám, hệ thống máy móc hiện đại và tiêu chuẩn vô trùng.'
            : 'Discover our clinic space, modern equipment, and sterilization standards.'
        }
      />
    </section>
  );
}
