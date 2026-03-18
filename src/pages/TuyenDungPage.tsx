import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function AboutRecruitmentPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Tuyển dụng' : 'NHA KHOA TẬN TÂM | Recruitment');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Tuyển dụng' : 'Recruitment'}
        description={
          isVi
            ? 'Thông tin vị trí đang tuyển, quyền lợi và môi trường làm việc tại Tâm Đức Smile.'
            : 'Open positions, benefits, and working environment at Tam Duc Smile.'
        }
      />
    </section>
  );
}
