import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function KnowledgeImplantPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Kiến thức Implant' : 'NHA KHOA TẬN TÂM | Implant Knowledge');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Kiến thức' : 'Knowledge'}
        title={isVi ? 'Kiến thức Implant' : 'Implant Knowledge'}
        description={
          isVi
            ? 'Tổng hợp kiến thức về cấy ghép Implant, ưu điểm, quy trình và lưu ý chăm sóc sau điều trị.'
            : 'Key information about implant treatment, benefits, procedure, and post-treatment care.'
        }
      />
    </section>
  );
}
