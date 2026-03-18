import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function KnowledgeBracesPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Kiến thức niềng răng' : 'NHA KHOA TẬN TÂM | Braces Knowledge');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Kiến thức' : 'Knowledge'}
        title={isVi ? 'Kiến thức niềng răng' : 'Braces Knowledge'}
        description={
          isVi
            ? 'Thông tin cần biết về niềng răng, các phương pháp phổ biến và cách chăm sóc trong quá trình niềng.'
            : 'Essential orthodontic knowledge, popular options, and care tips during treatment.'
        }
      />
    </section>
  );
}
