import { SectionTitle } from '@/components/common/SectionTitle';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Link } from 'react-router-dom';

export function AboutPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TAN TAM | Ve Tam Duc Smile' : 'NHA KHOA TAN TAM | About Tam Duc Smile');

  const values = isVi
    ? [
        {
          title: 'Tan tam dieu tri',
          description:
            'Moi ke hoach cham soc duoc thiet ke theo tinh trang thuc te cua khach hang, uu tien an toan va hieu qua lau dai.',
        },
        {
          title: 'Minh bach chi phi',
          description: 'Bao gia ro rang truoc dieu tri, tu van day du phuong an va cam ket khong phat sinh ngoai ke hoach.',
        },
        {
          title: 'Lien tuc cap nhat',
          description:
            'Doi ngu chuyen mon thuong xuyen cap nhat ky thuat moi de toi uu trai nghiem va chat luong ket qua dieu tri.',
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
        { year: '2015', content: 'Khoi dau voi dinh huong xay dung he thong nha khoa lay chat luong dieu tri lam trong tam.' },
        { year: '2019', content: 'Mo rong doi ngu bac si chuyen sau va chuan hoa quy trinh cham soc khach hang da diem cham.' },
        { year: '2023', content: 'Tang cuong dau tu cong nghe chan doan, nang cao do chinh xac va trai nghiem dieu tri.' },
        { year: '2026', content: 'Tiep tuc mo rong dich vu toan dien voi muc tieu dong hanh suc khoe rang mieng lau dai.' },
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
        eyebrow={isVi ? 'Gioi thieu' : 'About'}
        title={isVi ? 'Ve Tam Duc Smile' : 'About Tam Duc Smile'}
        description={
          isVi
            ? 'Chung toi theo duoi triet ly dieu tri tan tam, minh bach va ben vung de moi khach hang deu tu tin voi nu cuoi cua minh.'
            : 'We pursue caring, transparent, and sustainable treatment principles so every patient can smile with confidence.'
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Su menh' : 'Mission'}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isVi
              ? 'Mang lai giai phap nha khoa an toan, ca nhan hoa va de tiep can de moi khach hang chu dong cham soc suc khoe rang mieng lau dai.'
              : 'Deliver safe, personalized, and accessible dental solutions so patients can maintain long-term oral health with confidence.'}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Tam nhin' : 'Vision'}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {isVi
              ? 'Tro thanh he thong nha khoa duoc khach hang tin tuong nho chat luong dieu tri on dinh, dich vu chuyen nghiep va trai nghiem nhat quan.'
              : 'Become a trusted dental system known for consistent treatment quality, professional service, and reliable patient experience.'}
          </p>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Gia tri cot loi' : 'Core Values'}</h3>
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
        <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Cot moc phat trien' : 'Milestones'}</h3>
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
        <h3 className="text-2xl font-black">{isVi ? 'Kham pha them ve chung toi' : 'Explore More'}</h3>
        <p className="mt-2 text-sm leading-7 text-blue-100">
          {isVi
            ? 'Xem doi ngu bac si va co so vat chat de hieu ro hon ve nang luc chuyen mon cung nhu quy trinh dieu tri tai Tam Duc Smile.'
            : 'Visit our doctor team and facilities pages to understand our capabilities and treatment environment in more detail.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to={ROUTES.aboutTeam}
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            {isVi ? 'Doi ngu bac si' : 'Our Doctors'}
          </Link>
          <Link
            to={ROUTES.aboutFacilities}
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            {isVi ? 'Co so vat chat' : 'Facilities'}
          </Link>
        </div>
      </div>
    </section>
  );
}
