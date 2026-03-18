import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function KnowledgePorcelainPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Kiến thức răng sứ' : 'NHA KHOA TẬN TÂM | Porcelain Knowledge');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Kiến thức' : 'Knowledge'}
        title={isVi ? 'Kiến thức răng sứ' : 'Porcelain Knowledge'}
        description={
          isVi
            ? 'Giải đáp các thắc mắc về răng sứ, tuổi thọ, thẩm mỹ và cách chăm sóc sau khi phục hình.'
            : 'Answers about porcelain crowns, longevity, aesthetics, and care after restoration.'
        }
      />
    </section>
  );
}
