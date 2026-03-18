import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function AboutPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Về Tâm Đức Smile' : 'NHA KHOA TẬN TÂM | About Tam Duc Smile');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Về Tâm Đức Smile' : 'About Tam Duc Smile'}
        description={
          isVi
            ? 'Hành trình phát triển, sứ mệnh và cam kết mang đến trải nghiệm nha khoa chất lượng cho khách hàng.'
            : 'Our journey, mission, and commitment to providing high-quality dental experiences.'
        }
      />

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm leading-6 text-slate-600">
          {isVi
            ? 'Đây là trang giới thiệu tổng quan, có thể mở rộng thêm lịch sử hình thành, giá trị cốt lõi, đội ngũ chuyên môn và các cột mốc quan trọng của thương hiệu.'
            : 'This is an overview page where you can expand brand history, core values, expert teams, and important milestones.'}
        </p>
      </div>
    </section>
  );
}
