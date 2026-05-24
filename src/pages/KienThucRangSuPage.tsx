import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import porcelainHeroImage from '@/assets/images/rang_su1.JPG?url';
import porcelainProcessImage from '@/assets/images/rang_su2.JPG?url';
import { CalendarCheck, CheckCircle2, ClipboardList, ImagePlus, ShieldCheck, Smile, Sparkles, Stethoscope } from 'lucide-react';

const porcelainBenefits = [
  {
    icon: Sparkles,
    viTitle: 'Thẩm mỹ tự nhiên',
    enTitle: 'Natural aesthetics',
    viText: 'Răng sứ được thiết kế theo màu răng, dáng răng và đường cười để tạo vẻ hài hòa với khuôn mặt.',
    enText: 'Porcelain restorations are designed around tooth shade, shape, and smile line for a balanced appearance.',
  },
  {
    icon: ShieldCheck,
    viTitle: 'Bảo vệ răng thật',
    enTitle: 'Protect natural teeth',
    viText: 'Mão sứ có thể giúp che chở răng đã chữa tủy, răng nứt mẻ hoặc răng có mô răng yếu.',
    enText: 'A crown can protect root-treated, chipped, cracked, or structurally weakened teeth.',
  },
  {
    icon: Smile,
    viTitle: 'Phục hồi ăn nhai',
    enTitle: 'Restore chewing',
    viText: 'Phục hình sứ đúng khớp cắn giúp cải thiện khả năng ăn nhai và cảm giác tự tin khi giao tiếp.',
    enText: 'A well-fitted restoration improves chewing function and confidence in daily communication.',
  },
];

const porcelainOptions = [
  {
    viTitle: 'Mão răng sứ',
    enTitle: 'Porcelain crown',
    viText: 'Phù hợp với răng sâu lớn, vỡ mẻ nhiều, răng đã chữa tủy hoặc cần phục hồi hình dáng và độ bền.',
    enText: 'Suitable for large cavities, heavily chipped teeth, root-treated teeth, or teeth needing strength and shape restoration.',
  },
  {
    viTitle: 'Dán sứ Veneer',
    enTitle: 'Porcelain veneer',
    viText: 'Lớp sứ mỏng ở mặt ngoài răng, thường dùng để cải thiện màu sắc, hình dáng hoặc khe thưa nhẹ.',
    enText: 'A thin porcelain layer on the front surface, often used to improve shade, shape, or small gaps.',
  },
  {
    viTitle: 'Cầu răng sứ',
    enTitle: 'Porcelain bridge',
    viText: 'Một lựa chọn phục hồi răng mất bằng cách tựa trên các răng kế cận khi điều kiện lâm sàng phù hợp.',
    enText: 'An option for replacing missing teeth by anchoring on adjacent teeth when clinically suitable.',
  },
];

const porcelainSteps = [
  {
    viTitle: 'Thăm khám và tư vấn',
    enTitle: 'Examination and consultation',
    viText: 'Bác sĩ kiểm tra răng, nướu, khớp cắn và trao đổi mục tiêu thẩm mỹ trước khi lên kế hoạch.',
    enText: 'The dentist evaluates teeth, gums, bite, and aesthetic goals before planning treatment.',
  },
  {
    viTitle: 'Thiết kế dáng răng',
    enTitle: 'Smile design',
    viText: 'Màu sắc, hình thể và tỉ lệ răng được lựa chọn để phù hợp gương mặt và mong muốn của khách hàng.',
    enText: 'Shade, shape, and tooth proportions are selected to match the face and patient preferences.',
  },
  {
    viTitle: 'Chuẩn bị răng và lấy dấu',
    enTitle: 'Tooth preparation and impression',
    viText: 'Bác sĩ xử lý mô răng cần thiết, lấy dấu hoặc quét dữ liệu để labo chế tác phục hình sứ.',
    enText: 'The dentist prepares the tooth as needed and takes impressions or scans for lab fabrication.',
  },
  {
    viTitle: 'Gắn sứ và kiểm tra',
    enTitle: 'Bonding and adjustment',
    viText: 'Phục hình được thử màu, kiểm tra khớp cắn, gắn cố định và hướng dẫn chăm sóc sau điều trị.',
    enText: 'The restoration is shade-checked, bite-adjusted, bonded, and followed by care guidance.',
  },
];

const careTips = [
  {
    vi: 'Chải răng ít nhất 2 lần mỗi ngày bằng bàn chải mềm và kem đánh răng phù hợp.',
    en: 'Brush at least twice daily with a soft toothbrush and suitable toothpaste.',
  },
  {
    vi: 'Dùng chỉ nha khoa hoặc máy tăm nước để làm sạch kẽ răng và vùng sát viền nướu.',
    en: 'Use floss or a water flosser to clean between teeth and near the gumline.',
  },
  {
    vi: 'Tránh cắn vật cứng, mở nắp chai hoặc nhai đá để hạn chế nứt mẻ phục hình.',
    en: 'Avoid biting hard objects, opening bottle caps, or chewing ice to reduce chipping risk.',
  },
  {
    vi: 'Tái khám định kỳ để kiểm tra khớp cắn, viền nướu và độ khít của răng sứ.',
    en: 'Schedule regular checkups to evaluate bite, gum margins, and restoration fit.',
  },
];

const faqs = [
  {
    viQuestion: 'Bọc răng sứ có cần mài răng không?',
    enQuestion: 'Does a porcelain crown require tooth reduction?',
    viAnswer: 'Thông thường cần chuẩn bị một phần mô răng để mão sứ ôm khít và bền chắc. Mức độ mài phụ thuộc tình trạng răng và loại phục hình.',
    enAnswer: 'Usually, some tooth preparation is needed for a secure crown fit. The amount depends on tooth condition and restoration type.',
  },
  {
    viQuestion: 'Răng sứ dùng được bao lâu?',
    enQuestion: 'How long do porcelain restorations last?',
    viAnswer: 'Tuổi thọ phụ thuộc vật liệu, kỹ thuật thực hiện, khớp cắn và cách chăm sóc. Vệ sinh tốt và tái khám đều giúp phục hình bền hơn.',
    enAnswer: 'Longevity depends on material, technique, bite, and care. Good hygiene and regular checkups help restorations last longer.',
  },
  {
    viQuestion: 'Làm răng sứ có bị hôi miệng không?',
    enQuestion: 'Can porcelain restorations cause bad breath?',
    viAnswer: 'Răng sứ đúng khít và vệ sinh tốt thường không gây hôi miệng. Mùi khó chịu có thể liên quan viền sứ hở, viêm nướu hoặc mảng bám.',
    enAnswer: 'Well-fitted restorations with good hygiene usually do not cause bad breath. Odor may relate to open margins, gum inflammation, or plaque.',
  },
];

export function KnowledgePorcelainPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Kiến thức răng sứ' : 'NHA KHOA TẬN TÂM | Porcelain Knowledge');

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow={isVi ? 'Kiến thức' : 'Knowledge'}
              title={isVi ? 'Kiến thức răng sứ' : 'Porcelain Knowledge'}
              description={
                isVi
                  ? 'Giải đáp các thắc mắc về răng sứ, thẩm mỹ nụ cười, tuổi thọ và cách chăm sóc sau khi phục hình.'
                  : 'Answers about porcelain restorations, smile aesthetics, longevity, and care after treatment.'
              }
            />

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(isVi
                ? ['Dáng răng hài hòa', 'Màu sắc tự nhiên', 'Ăn nhai ổn định']
                : ['Balanced tooth shape', 'Natural shade', 'Stable chewing']
              ).map((item) => (
                <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-sky-300 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5">
            <img
              src={porcelainHeroImage}
              alt={isVi ? 'Kiến thức răng sứ' : 'Porcelain knowledge'}
              className="aspect-[4/3] w-full rounded-2xl border border-white object-cover shadow-inner"
            />
            <div className="hidden aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-white bg-white/75 text-center shadow-inner">
              <ImagePlus className="h-12 w-12 text-sky-600" aria-hidden="true" />
              <p className="mt-4 text-base font-bold text-slate-900">{isVi ? 'Khu vực thêm hình ảnh răng sứ' : 'Porcelain image area'}</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {isVi
                  ? 'Bạn có thể thay khối này bằng ảnh nụ cười, bảng màu răng, mão sứ hoặc ảnh trước - sau.'
                  : 'Replace this block with smile, shade guide, crown, or before-after imagery.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {porcelainBenefits.map((benefit) => {
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
          <h3 className="mt-5 text-2xl font-black">{isVi ? 'Răng sứ phù hợp với ai?' : 'Who is porcelain restoration for?'}</h3>
          <p className="mt-3 leading-7 text-slate-300">
            {isVi
              ? 'Phục hình răng sứ thường phù hợp với răng sứt mẻ, đổi màu nặng, hình thể chưa đẹp, răng đã chữa tủy hoặc cần cải thiện thẩm mỹ vùng răng trước.'
              : 'Porcelain restorations are often suitable for chipped, severely discolored, misshapen, root-treated teeth, or front teeth needing aesthetic improvement.'}
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
            {isVi
              ? 'Lưu ý: bác sĩ cần đánh giá mô răng thật, nướu và khớp cắn để chọn giải pháp bảo tồn nhất có thể.'
              : 'Note: the dentist should evaluate natural tooth structure, gums, and bite to choose the most conservative option possible.'}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{isVi ? 'Lựa chọn' : 'Options'}</p>
              <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Các phục hình sứ phổ biến' : 'Popular porcelain restorations'}</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {porcelainOptions.map((option) => (
              <article key={option.viTitle} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-extrabold text-slate-900">{isVi ? option.viTitle : option.enTitle}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{isVi ? option.viText : option.enText}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <ClipboardList className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{isVi ? 'Quy trình' : 'Procedure'}</p>
            <h3 className="text-2xl font-black text-slate-900">{isVi ? '4 bước làm răng sứ cơ bản' : '4 basic porcelain treatment steps'}</h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {porcelainSteps.map((step, index) => (
            <article key={step.viTitle} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-sm font-black text-white">{index + 1}</div>
              <h4 className="mt-4 font-extrabold text-slate-900">{isVi ? step.viTitle : step.enTitle}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{isVi ? step.viText : step.enText}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CalendarCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Chăm sóc sau khi làm răng sứ' : 'Care after porcelain treatment'}</h3>
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
            src={porcelainProcessImage}
            alt={isVi ? 'Ảnh minh họa phục hình răng sứ' : 'Porcelain restoration illustration'}
            className="min-h-[320px] w-full rounded-2xl object-cover"
          />
          <div className="hidden min-h-[320px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 text-center">
            <ImagePlus className="h-10 w-10 text-slate-500" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-slate-900">{isVi ? 'Ảnh minh họa phục hình sứ' : 'Porcelain restoration image placeholder'}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {isVi
                ? 'Gợi ý: thêm ảnh thiết kế nụ cười, mão sứ trên mẫu hàm hoặc kết quả sau khi hoàn thiện.'
                : 'Suggested: add smile design, crowns on a model, or completed restoration images.'}
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
