import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function PriceBracesPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Giá niềng răng' : 'NHA KHOA TẬN TÂM | Braces Price');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Bảng giá' : 'Pricing'}
        title={isVi ? 'Giá niềng răng' : 'Braces Price'}
        description={
          isVi
            ? 'Cập nhật mức giá niềng răng theo từng phương pháp như mắc cài kim loại, sứ và Invisalign.'
            : 'Updated pricing for orthodontic methods such as metal braces, ceramic braces, and Invisalign.'
        }
      />
    </section>
  );
}
