import { SectionTitle } from '@/components/common/SectionTitle';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Link } from 'react-router-dom';

export function AboutPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Về Tận Tâm Smile' : 'NHA KHOA TAN TAM | About Tan Tam Smile');

  const values = isVi
    ? [
        {
          title: 'Tận tâm điều trị',
          description:
            'Mỗi kế hoạch chăm sóc được thiết kế theo tình trạng thực tế của khách hàng, ưu tiên an toàn và hiệu quả lâu dài.',
        },
        {
          title: 'Minh bạch chi phí',
          description: 'Báo giá rõ ràng trước điều trị, tư vấn đầy đủ phương án và cam kết không phát sinh ngoài kế hoạch.',
        },
        {
          title: 'Liên tục cập nhật',
          description:
            'Đội ngũ chuyên môn thường xuyên cập nhật kỹ thuật mới để tối ưu trải nghiệm và chất lượng kết quả điều trị.',
        },
      ]
    : [
        {
          title: 'Patient-Centered Care',
          description:
            'Every treatment plan is tailored to each patient, with safety and long-term oral health as top priorities.',
        },
        {
          title: 'Transparent Pricing',
          description:
            'We provide clear quotations before treatment and explain all options to avoid unexpected additional costs.',
        },
        {
          title: 'Continuous Improvement',
          description:
            'Our dental team continuously updates clinical skills and workflows to improve treatment quality and comfort.',
        },
      ];

  const milestones = isVi
    ? [
        { year: '2015', content: 'Khởi đầu với định hướng xây dựng hệ thống nha khoa lấy chất lượng điều trị làm trọng tâm.' },
        { year: '2019', content: 'Mở rộng đội ngũ bác sĩ chuyên sâu và chuẩn hóa quy trình chăm sóc khách hàng đa điểm chạm.' },
        { year: '2023', content: 'Tăng cường đầu tư công nghệ chẩn đoán, nâng cao độ chính xác và trải nghiệm điều trị.' },
        { year: '2026', content: 'Tiếp tục mở rộng dịch vụ toàn diện với mục tiêu đồng hành sức khỏe răng miệng lâu dài.' },
      ]
    : [
        { year: '2015', content: 'Started with a quality-first vision focused on reliable and responsible dental treatment.' },
        { year: '2019', content: 'Expanded specialist teams and standardized patient care workflows across touchpoints.' },
        { year: '2023', content: 'Invested further in diagnostics technology for better treatment precision and comfort.' },
        { year: '2026', content: 'Continuing to expand comprehensive services for long-term oral health companionship.' },
      ];

  return (
    <section className="space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Về Tận Tâm Smile' : 'About Tan Tam Smile'}
        description={
          isVi
            ? 'Chúng tôi theo đuổi triết lý điều trị tận tâm, minh bạch và bền vững để mỗi khách hàng đều tự tin với nụ cười của mình.'
            : 'We pursue caring, transparent, and sustainable treatment principles so every patient can smile with confidence.'
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Sứ mệnh' : 'Mission'}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isVi
              ? 'Mang lại giải pháp nha khoa an toàn, cá nhân hóa và dễ tiếp cận để mỗi khách hàng chủ động chăm sóc sức khỏe răng miệng lâu dài.'
              : 'Deliver safe, personalized, and accessible dental solutions so patients can maintain long-term oral health with confidence.'}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Tầm nhìn' : 'Vision'}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isVi
              ? 'Trở thành hệ thống nha khoa được khách hàng tin tưởng nhờ chất lượng điều trị ổn định, dịch vụ chuyên nghiệp và trải nghiệm nhất quán.'
              : 'Become a trusted dental system known for consistent treatment quality, professional service, and reliable patient experience.'}
          </p>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Giá trị cốt lõi' : 'Core Values'}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article key={value.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-lg font-bold text-slate-900">{value.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Cột mốc phát triển' : 'Milestones'}</h3>
        <div className="mt-4 grid gap-3">
          {milestones.map((item) => (
            <div key={item.year} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[96px_1fr]">
              <p className="text-xl font-black text-blue-700">{item.year}</p>
              <p className="text-sm leading-7 text-slate-600">{item.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-700 to-blue-800 p-5 text-white">
        <h3 className="text-2xl font-black">{isVi ? 'Khám phá thêm về chúng tôi' : 'Explore More'}</h3>
        <p className="mt-2 text-sm leading-7 text-blue-100">
          {isVi
            ? 'Xem đội ngũ bác sĩ và cơ sở vật chất để hiểu rõ hơn về năng lực chuyên môn cũng như quy trình điều trị tại Tận Tâm Smile.'
            : 'Visit our doctor team and facilities pages to understand our capabilities and treatment environment in more detail.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to={ROUTES.aboutTeam}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            {isVi ? 'Đội ngũ bác sĩ' : 'Our Doctors'}
          </Link>
          <Link
            to={ROUTES.aboutFacilities}
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            {isVi ? 'Cơ sở vật chất' : 'Facilities'}
          </Link>
        </div>
      </div>
    </section>
  );
}
