import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import implantProcessImage from '@/assets/images/hinh2.JPG?url';
import implantBanner from '@/assets/images/implant_toanham_banner.png';
import { CalendarCheck, CheckCircle2, ClipboardList, ImagePlus, ShieldCheck, Smile, Sparkles, Stethoscope } from 'lucide-react';

const implantBenefits = [
  {
    icon: ShieldCheck,
    viTitle: 'Ăn nhai chắc khỏe',
    enTitle: 'Stable chewing',
    viText: 'Trụ Implant thay thế chân răng đã mất, giúp lực nhai ổn định hơn so với hàm tháo lắp.',
    enText: 'Implants replace the missing tooth root, helping restore chewing stability better than removable dentures.',
  },
  {
    icon: Smile,
    viTitle: 'Bảo tồn răng kế cận',
    enTitle: 'Protect nearby teeth',
    viText: 'Không cần mài hai răng bên cạnh như phương pháp cầu răng truyền thống.',
    enText: 'No need to grind adjacent teeth as in a traditional dental bridge.',
  },
  {
    icon: Sparkles,
    viTitle: 'Thẩm mỹ tự nhiên',
    enTitle: 'Natural appearance',
    viText: 'Răng sứ trên Implant được thiết kế theo màu sắc, hình dáng và khớp cắn của từng khách hàng.',
    enText: 'The crown is designed to match each patient’s shade, tooth shape, and bite.',
  },
];

const implantSteps = [
  {
    viTitle: 'Thăm khám và chụp phim',
    enTitle: 'Examination and imaging',
    viText: 'Bác sĩ kiểm tra tình trạng răng, nướu, xương hàm và lập kế hoạch điều trị phù hợp.',
    enText: 'The dentist evaluates teeth, gums, jawbone condition, and creates a suitable treatment plan.',
  },
  {
    viTitle: 'Đặt trụ Implant',
    enTitle: 'Implant placement',
    viText: 'Trụ Titanium được đặt vào xương hàm trong điều kiện vô khuẩn, có gây tê để giảm khó chịu.',
    enText: 'A titanium post is placed into the jawbone under sterile conditions with local anesthesia.',
  },
  {
    viTitle: 'Theo dõi tích hợp xương',
    enTitle: 'Osseointegration follow-up',
    viText: 'Bác sĩ hẹn kiểm tra định kỳ trong thời gian trụ Implant liên kết với xương hàm.',
    enText: 'Follow-up visits help monitor the implant as it integrates with the jawbone.',
  },
  {
    viTitle: 'Gắn mão sứ hoàn thiện',
    enTitle: 'Final crown restoration',
    viText: 'Sau khi trụ ổn định, mão sứ được gắn để hoàn thiện chức năng ăn nhai và thẩm mỹ.',
    enText: 'Once stable, the final crown is attached to restore chewing function and aesthetics.',
  },
];

const careTips = [
  {
    vi: 'Chườm lạnh và dùng thuốc theo đúng hướng dẫn của bác sĩ trong ngày đầu.',
    en: 'Apply cold compresses and take medication as instructed on the first day.',
  },
  {
    vi: 'Ăn thức ăn mềm, tránh nhai mạnh trực tiếp tại vùng vừa cấy ghép.',
    en: 'Choose soft foods and avoid heavy chewing directly on the implant area.',
  },
  {
    vi: 'Vệ sinh răng miệng nhẹ nhàng, dùng bàn chải mềm và nước súc miệng được khuyến nghị.',
    en: 'Clean gently with a soft toothbrush and recommended mouth rinse.',
  },
  {
    vi: 'Tái khám đúng lịch để bác sĩ theo dõi mức độ lành thương và tích hợp xương.',
    en: 'Attend scheduled visits so the dentist can monitor healing and integration.',
  },
];

const faqs = [
  {
    viQuestion: 'Cấy ghép Implant có đau không?',
    enQuestion: 'Is implant treatment painful?',
    viAnswer: 'Quá trình đặt trụ thường được gây tê tại chỗ. Sau điều trị có thể ê nhẹ vài ngày và được kiểm soát bằng hướng dẫn chăm sóc, thuốc theo toa.',
    enAnswer: 'Placement is usually performed under local anesthesia. Mild soreness may occur for a few days and can be managed with care instructions and prescribed medication.',
  },
  {
    viQuestion: 'Mất răng lâu năm có trồng Implant được không?',
    enQuestion: 'Can long-term missing teeth be replaced with implants?',
    viAnswer: 'Có thể, nhưng cần thăm khám xương hàm. Một số trường hợp cần ghép xương hoặc nâng xoang trước khi đặt trụ.',
    enAnswer: 'Often yes, but jawbone assessment is needed. Some cases may require bone grafting or sinus lift before placement.',
  },
  {
    viQuestion: 'Bao lâu thì hoàn tất một răng Implant?',
    enQuestion: 'How long does one implant tooth take?',
    viAnswer: 'Thời gian phụ thuộc tình trạng xương và kế hoạch điều trị. Thông thường cần giai đoạn chờ tích hợp xương trước khi gắn mão sứ.',
    enAnswer: 'Timing depends on bone condition and treatment planning. Usually there is a healing period before the final crown is attached.',
  },
];

export function KnowledgeImplantPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Kiến thức Implant' : 'NHA KHOA TẬN TÂM | Implant Knowledge');

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow={isVi ? 'Kiến thức' : 'Knowledge'}
              title={isVi ? 'Kiến thức Implant' : 'Implant Knowledge'}
              description={
                isVi
                  ? 'Tổng hợp kiến thức về cấy ghép Implant, ưu điểm, quy trình và lưu ý chăm sóc sau điều trị.'
                  : 'Key information about implant treatment, benefits, procedure, and post-treatment care.'
              }
            />

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(isVi
                ? ['Phục hồi răng mất', 'Giữ xương hàm ổn định', 'Ăn nhai tự nhiên']
                : ['Missing tooth restoration', 'Jawbone support', 'Natural chewing']
              ).map((item) => (
                <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-sky-300 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5">
            <img
              src={implantBanner}
              alt={isVi ? 'Kiến thức cấy ghép Implant toàn hàm' : 'Full arch implant knowledge'}
              className="aspect-[4/3] w-full rounded-2xl border border-white object-cover shadow-inner"
            />
            <div className="hidden aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-white bg-white/75 text-center shadow-inner">
              <ImagePlus className="h-12 w-12 text-sky-600" aria-hidden="true" />
              <p className="mt-4 text-base font-bold text-slate-900">{isVi ? 'Khu vực thêm hình ảnh Implant' : 'Implant image area'}</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {isVi
                  ? 'Bạn có thể thay khối này bằng ảnh phòng khám, mô phỏng trụ Implant hoặc ảnh trước - sau.'
                  : 'Replace this block with a clinic photo, implant illustration, or before-after image.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {implantBenefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article key={benefit.viTitle} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{isVi ? benefit.viTitle : benefit.enTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{isVi ? benefit.viText : benefit.enText}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-300/60 md:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Stethoscope className="h-6 w-6 text-cyan-200" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-2xl font-black">{isVi ? 'Implant phù hợp với ai?' : 'Who is implant treatment for?'}</h3>
          <p className="mt-3 leading-7 text-slate-300">
            {isVi
              ? 'Implant thường phù hợp với người mất một răng, nhiều răng hoặc mất răng toàn hàm, có sức khỏe tổng quát ổn định và mong muốn phục hồi lâu dài.'
              : 'Implants are usually suitable for people missing one tooth, multiple teeth, or a full arch, with stable general health and long-term restoration goals.'}
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
            {isVi
              ? 'Lưu ý: kế hoạch điều trị cần được cá nhân hóa sau khi bác sĩ thăm khám, chụp phim và đánh giá xương hàm.'
              : 'Note: treatment planning should be personalized after examination, imaging, and jawbone assessment.'}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{isVi ? 'Quy trình' : 'Procedure'}</p>
              <h3 className="text-2xl font-black text-slate-900">{isVi ? '4 bước cấy ghép Implant' : '4 implant treatment steps'}</h3>
            </div>
          </div>

          <div className="space-y-4">
            {implantSteps.map((step, index) => (
              <div key={step.viTitle} className="grid grid-cols-[44px_1fr] gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">{index + 1}</div>
                <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-extrabold text-slate-900">{isVi ? step.viTitle : step.enTitle}</h4>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{isVi ? step.viText : step.enText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CalendarCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Chăm sóc sau cấy ghép' : 'Aftercare essentials'}</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {careTips.map((tip) => (
              <div key={tip.vi} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-600" aria-hidden="true" />
                <p className="text-sm leading-6 text-slate-700">{isVi ? tip.vi : tip.en}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5">
          <img
            src={implantProcessImage}
            alt={isVi ? 'Ảnh minh họa quy trình cấy ghép Implant' : 'Implant procedure illustration'}
            className="min-h-[320px] w-full rounded-2xl object-cover"
          />
          <div className="hidden min-h-[320px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 text-center">
            <ImagePlus className="h-10 w-10 text-slate-500" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-slate-900">{isVi ? 'Ảnh minh họa quy trình' : 'Procedure image placeholder'}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {isVi
                ? 'Gợi ý: thêm ảnh bác sĩ tư vấn, phim CT Cone Beam hoặc ảnh phục hình hoàn thiện.'
                : 'Suggested: add consultation, CBCT scan, or final restoration imagery.'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">FAQ</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{isVi ? 'Câu hỏi thường gặp' : 'Frequently asked questions'}</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.viQuestion} className="rounded-2xl border border-slate-200 p-5">
              <h4 className="font-extrabold text-slate-900">{isVi ? faq.viQuestion : faq.enQuestion}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{isVi ? faq.viAnswer : faq.enAnswer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
