import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function PricePorcelainPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Giá bọc răng sứ' : 'NHA KHOA TẬN TÂM | Porcelain Crown Price');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Bảng giá' : 'Pricing'}
        title={isVi ? 'Giá bọc răng sứ' : 'Porcelain Crown Price'}
        description={
          isVi
            ? 'Bảng giá bọc răng sứ theo từng dòng vật liệu và nhu cầu thẩm mỹ cụ thể.'
            : 'Porcelain crown pricing by material line and specific aesthetic needs.'
        }
      />
    </section>
  );
}
