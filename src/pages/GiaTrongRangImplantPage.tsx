import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function PriceImplantPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Giá trồng răng Implant' : 'NHA KHOA TẬN TÂM | Implant Price');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Bảng giá' : 'Pricing'}
        title={isVi ? 'Giá trồng răng Implant' : 'Implant Price'}
        description={
          isVi
            ? 'Thông tin chi phí trồng răng Implant theo từng loại trụ và tình trạng răng của khách hàng.'
            : 'Implant pricing based on implant type and each patient dental condition.'
        }
      />
    </section>
  );
}
