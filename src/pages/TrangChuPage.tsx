import bannerHome from '@/assets/images/banner.png';
import veChungToi from '@/assets/images/ve-chung-toi.webp';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function HomePage() {
  const { language } = useLanguage();

  const isVi = language === 'vi';
  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Trang chủ' : 'NHA KHOA TẬN TÂM | Home');

  const quickActions = isVi
    ? [
        { icon: '📞', title: 'Hotline Tư Vấn', description: 'Tư vấn nhanh - miễn phí' },
        { icon: '🗓️', title: 'Đặt Lịch Hẹn', description: 'Nhanh chóng, tiện lợi' },
        { icon: '🪪', title: 'Tra Cứu Bảo Hành', description: 'Thông tin nhanh, chính xác' },
      ]
    : [
        { icon: '📞', title: 'Consult Hotline', description: 'Fast and free consultation' },
        { icon: '🗓️', title: 'Book Appointment', description: 'Quick and convenient' },
        { icon: '🪪', title: 'Warranty Lookup', description: 'Fast and accurate information' },
      ];

  const reasons = isVi
    ? [
        {
          number: '01',
          title: 'Bác sĩ giỏi tận tâm',
          description:
            'Đội ngũ bác sĩ nha khoa hơn 10 năm kinh nghiệm, chuyên sâu từng lĩnh vực như niềng răng, Implant, bọc sứ, luôn tận tâm trong điều trị.',
        },
        {
          number: '02',
          title: 'Hệ thống nha khoa uy tín',
          description:
            'Nha khoa Tận Tâm có nhiều chi nhánh trên toàn quốc, giúp Quý khách dễ dàng tiếp cận dịch vụ chất lượng, thuận tiện đặt lịch.',
        },
        {
          number: '03',
          title: 'Công nghệ hiện đại',
          description:
            'Trang bị máy móc hiện đại giúp chẩn đoán chính xác, hỗ trợ điều trị không đau, nhanh lành, đảm bảo an toàn và hiệu quả lâu dài.',
        },
        {
          number: '04',
          title: 'Cam kết minh bạch',
          description:
            'Tất cả dịch vụ đều có bảng giá công khai, tư vấn rõ ràng, hợp đồng minh bạch - cam kết không phát sinh chi phí ngoài báo giá ban đầu.',
        },
        {
          number: '05',
          title: 'Hỗ trợ tài chính tốt',
          description:
            'Hỗ trợ trả góp 0%, bảo hành đến trọn đời tùy dịch vụ, thường xuyên tặng voucher - giúp Quý khách dễ dàng tiếp cận các dịch vụ cao cấp.',
        },
        {
          number: '06',
          title: 'Khách hàng tin chọn',
          description:
            '15.000+ khách hàng đã hài lòng, để lại hàng ngàn phản hồi tích cực trên Google & Facebook - khẳng định niềm tin dành cho Nha Khoa Tận Tâm.',
        },
      ]
    : [
        {
          number: '01',
          title: 'Skilled & dedicated doctors',
          description:
            'Our dental team has over 10 years of experience, with deep expertise in braces, implants, and porcelain solutions.',
        },
        {
          number: '02',
          title: 'Trusted dental system',
          description:
            'Tam Duc Smile has multiple branches nationwide, making it easier for patients to access quality care and book appointments.',
        },
        {
          number: '03',
          title: 'Modern technology',
          description:
            'Advanced equipment supports accurate diagnosis, gentle treatment, faster recovery, and long-term effectiveness.',
        },
        {
          number: '04',
          title: 'Transparent commitment',
          description:
            'All services have public pricing, clear consultation, and transparent contracts with no hidden costs beyond initial quotation.',
        },
        {
          number: '05',
          title: 'Strong financial support',
          description:
            '0% installment plans, long-term warranty, and regular vouchers help patients access high-quality dental services.',
        },
        {
          number: '06',
          title: 'Customer trust',
          description:
            '15,000+ satisfied customers and thousands of positive reviews on Google & Facebook reinforce trust in Tam Duc Smile.',
        },
      ];

  const leftReasons = reasons.slice(0, 3);
  const rightReasons = reasons.slice(3);

  return (
    <section className="space-y-16">
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-slate-200 bg-white shadow-xl shadow-slate-200/80">
        <img
          alt={isVi ? 'Banner nha khoa' : 'Dental banner'}
          className="h-[320px] w-full object-cover md:h-[400px] lg:h-[460px]"
          src={bannerHome}
        />

        <div className="absolute bottom-4 left-1/2 w-full max-w-5xl -translate-x-1/2 px-4">
          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/70 md:grid-cols-3">
            {quickActions.map((item) => (
              <button
                className="flex items-center gap-4 border-b border-slate-200 px-5 py-5 text-left transition hover:bg-sky-50 md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0"
                key={item.title}
                type="button"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-sky-200 bg-sky-50 text-xl">
                  {item.icon}
                </span>
                <span>
                  <strong className="block text-2xl font-bold text-sky-700">{item.title}</strong>
                  <span className="text-sm text-slate-600">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
        <p className="text-center text-sm font-medium text-sky-600">
          {isVi ? 'Lý do khách hàng tin chọn' : 'Why customers choose us'}
        </p>
        <h2 className="mt-2 text-center text-4xl font-black text-sky-700 md:text-5xl">
          {isVi ? 'NHA KHOA TẬN TÂM' : 'TAN TAM DENTAL'}
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr]">
          <div className="space-y-6">
            {leftReasons.map((item) => (
              <article className="text-center lg:text-left" key={item.number}>
                <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                  {item.number}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-sky-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <img alt={isVi ? 'Về chúng tôi' : 'About us'} className="w-full max-w-md" src={veChungToi} />
          </div>

          <div className="space-y-6">
            {rightReasons.map((item) => (
              <article className="text-center lg:text-left" key={item.number}>
                <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                  {item.number}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-sky-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
