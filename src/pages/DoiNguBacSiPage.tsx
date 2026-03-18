import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function AboutTeamPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đội ngũ bác sĩ' : 'NHA KHOA TẬN TÂM | Our Doctors');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Đội ngũ bác sĩ' : 'Our Doctors'}
        description={
          isVi
            ? 'Thông tin đội ngũ bác sĩ chuyên môn cao, giàu kinh nghiệm và tận tâm với khách hàng.'
            : 'Meet our highly qualified, experienced, and dedicated team of doctors.'
        }
      />
    </section>
  );
}
