import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import bracesHeroImage from '@/assets/images/nieng_rang1.JPG?url';
import bracesProcessImage from '@/assets/images/nieng_rang2.JPG?url';
import { CalendarCheck, CheckCircle2, ClipboardList, ImagePlus, ShieldCheck, Smile, Sparkles, Stethoscope } from 'lucide-react';

const bracesBenefits = [
  {
    icon: Smile,
    viTitle: 'Cải thiện khớp cắn',
    enTitle: 'Better bite alignment',
    viText: 'Niềng răng giúp điều chỉnh răng lệch lạc, hô, móm, chen chúc để khớp cắn cân bằng hơn.',
    enText: 'Braces help correct crowding, protrusion, underbite, and misalignment for a more balanced bite.',
  },
  {
    icon: ShieldCheck,
    viTitle: 'Dễ vệ sinh hơn',
    enTitle: 'Easier oral hygiene',
    viText: 'Khi răng đều hơn, việc chải răng và làm sạch kẽ răng thuận lợi hơn, giảm nguy cơ sâu răng và viêm nướu.',
    enText: 'Straighter teeth make brushing and interdental cleaning easier, reducing the risk of cavities and gum inflammation.',
  },
  {
    icon: Sparkles,
    viTitle: 'Nụ cười hài hòa',
    enTitle: 'Harmonious smile',
    viText: 'Kế hoạch chỉnh nha được thiết kế theo khuôn mặt, đường cười và mục tiêu thẩm mỹ của từng khách hàng.',
    enText: 'Orthodontic planning considers the face, smile line, and each patient’s aesthetic goals.',
  },
];

const bracesOptions = [
  {
    viTitle: 'Mắc cài kim loại',
    enTitle: 'Metal braces',
    viText: 'Phổ biến, bền chắc, hiệu quả với nhiều tình trạng răng lệch lạc từ đơn giản đến phức tạp.',
    enText: 'Common, durable, and effective for a wide range of simple to complex misalignment cases.',
  },
  {
    viTitle: 'Mắc cài sứ',
    enTitle: 'Ceramic braces',
    viText: 'Có màu gần giống răng thật, phù hợp với người muốn khí cụ kín đáo hơn khi giao tiếp.',
    enText: 'Tooth-colored brackets offer a more discreet look during daily communication.',
  },
  {
    viTitle: 'Khay trong suốt',
    enTitle: 'Clear aligners',
    viText: 'Dễ tháo lắp khi ăn uống và vệ sinh, phù hợp khi bác sĩ đánh giá ca chỉnh nha đáp ứng điều kiện.',
    enText: 'Removable for eating and cleaning, suitable when the orthodontic case meets clinical criteria.',
  },
];

const bracesSteps = [
  {
    viTitle: 'Thăm khám và phân tích răng',
    enTitle: 'Examination and analysis',
    viText: 'Bác sĩ kiểm tra khớp cắn, chụp phim, lấy dữ liệu răng và xác định vấn đề cần điều chỉnh.',
    enText: 'The dentist checks the bite, takes imaging and dental records, then identifies what needs correction.',
  },
  {
    viTitle: 'Lập phác đồ chỉnh nha',
    enTitle: 'Treatment planning',
    viText: 'Kế hoạch được cá nhân hóa theo tình trạng răng, độ tuổi, thẩm mỹ và thời gian điều trị dự kiến.',
    enText: 'The plan is personalized based on tooth condition, age, aesthetics, and expected treatment time.',
  },
  {
    viTitle: 'Gắn khí cụ hoặc giao khay',
    enTitle: 'Appliance placement',
    viText: 'Bác sĩ gắn mắc cài hoặc hướng dẫn sử dụng khay trong suốt, đồng thời dặn cách chăm sóc tại nhà.',
    enText: 'The dentist places braces or provides aligners, then explains daily care instructions.',
  },
  {
    viTitle: 'Tái khám và duy trì',
    enTitle: 'Follow-up and retention',
    viText: 'Tái khám định kỳ để điều chỉnh lực kéo. Sau khi tháo niềng, hàm duy trì giúp giữ kết quả ổn định.',
    enText: 'Regular visits adjust tooth movement. After treatment, retainers help maintain the result.',
  },
];

const careTips = [
  {
    vi: 'Chải răng kỹ quanh mắc cài, dây cung và đường viền nướu sau mỗi bữa ăn.',
    en: 'Brush carefully around brackets, wires, and the gumline after meals.',
  },
  {
    vi: 'Dùng bàn chải kẽ, chỉ nha khoa hoặc máy tăm nước theo hướng dẫn của bác sĩ.',
    en: 'Use interdental brushes, floss, or a water flosser as recommended by the dentist.',
  },
  {
    vi: 'Hạn chế thức ăn quá cứng, quá dai hoặc dính để tránh bung mắc cài và cong dây cung.',
    en: 'Avoid very hard, chewy, or sticky foods to prevent loose brackets and bent wires.',
  },
  {
    vi: 'Tái khám đúng hẹn để kiểm soát tiến độ di chuyển răng và xử lý khó chịu kịp thời.',
    en: 'Attend visits on schedule to monitor tooth movement and address discomfort promptly.',
  },
];

const faqs = [
  {
    viQuestion: 'Niềng răng mất bao lâu?',
    enQuestion: 'How long does braces treatment take?',
    viAnswer: 'Thời gian phụ thuộc mức độ lệch lạc, phương pháp chỉnh nha và sự hợp tác khi chăm sóc, tái khám. Bác sĩ sẽ ước lượng sau khi thăm khám.',
    enAnswer: 'Timing depends on misalignment severity, treatment method, and cooperation with care and follow-up visits. The dentist estimates it after examination.',
  },
  {
    viQuestion: 'Niềng răng có đau không?',
    enQuestion: 'Do braces hurt?',
    viAnswer: 'Bạn có thể ê răng vài ngày sau khi gắn khí cụ hoặc siết răng. Cảm giác này thường giảm dần khi răng thích nghi với lực chỉnh nha.',
    enAnswer: 'Teeth may feel sore for a few days after appliance placement or adjustment. This usually eases as teeth adapt to orthodontic force.',
  },
  {
    viQuestion: 'Người lớn có niềng răng được không?',
    enQuestion: 'Can adults get braces?',
    viAnswer: 'Có. Người lớn vẫn có thể chỉnh nha nếu răng, nướu và xương nâng đỡ đủ điều kiện. Một số ca cần điều trị nha chu trước.',
    enAnswer: 'Yes. Adults can have orthodontic treatment if teeth, gums, and supporting bone are suitable. Some cases need periodontal care first.',
  },
];

export function KnowledgeBracesPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Kiến thức niềng răng' : 'NHA KHOA TẬN TÂM | Braces Knowledge');

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow={isVi ? 'Kiến thức' : 'Knowledge'}
              title={isVi ? 'Kiến thức niềng răng' : 'Braces Knowledge'}
              description={
                isVi
                  ? 'Thông tin cần biết về niềng răng, các phương pháp phổ biến và cách chăm sóc trong quá trình chỉnh nha.'
                  : 'Essential orthodontic knowledge, popular options, and care tips during treatment.'
              }
            />

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {(isVi
                ? ['Răng đều hơn', 'Khớp cắn ổn định', 'Nụ cười tự tin']
                : ['Straighter teeth', 'Stable bite', 'Confident smile']
              ).map((item) => (
                <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-sky-300 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5">
            <img
              src={bracesHeroImage}
              alt={isVi ? 'Kiến thức niềng răng' : 'Braces knowledge'}
              className="aspect-[4/3] w-full rounded-2xl border border-white object-cover shadow-inner"
            />
            <div className="hidden aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-white bg-white/75 text-center shadow-inner">
              <ImagePlus className="h-12 w-12 text-sky-600" aria-hidden="true" />
              <p className="mt-4 text-base font-bold text-slate-900">{isVi ? 'Khu vực thêm hình ảnh niềng răng' : 'Braces image area'}</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {isVi
                  ? 'Bạn có thể thay khối này bằng ảnh mắc cài, khay trong suốt, bác sĩ tư vấn hoặc ảnh trước - sau.'
                  : 'Replace this block with braces, aligner, consultation, or before-after imagery.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {bracesBenefits.map((benefit) => {
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
          <h3 className="mt-5 text-2xl font-black">{isVi ? 'Niềng răng phù hợp với ai?' : 'Who is braces treatment for?'}</h3>
          <p className="mt-3 leading-7 text-slate-300">
            {isVi
              ? 'Niềng răng thường phù hợp với người có răng chen chúc, thưa, hô, móm, lệch đường giữa hoặc khớp cắn chưa hài hòa.'
              : 'Braces are commonly suitable for crowding, spacing, protrusion, underbite, midline deviation, or an imbalanced bite.'}
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
            {isVi
              ? 'Lưu ý: lựa chọn phương pháp niềng cần dựa trên thăm khám, phim chụp và phân tích khớp cắn của bác sĩ.'
              : 'Note: the orthodontic method should be chosen after examination, imaging, and bite analysis by the dentist.'}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{isVi ? 'Phương pháp' : 'Options'}</p>
              <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Các kiểu niềng phổ biến' : 'Popular orthodontic options'}</h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {bracesOptions.map((option) => (
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
            <h3 className="text-2xl font-black text-slate-900">{isVi ? '4 bước niềng răng cơ bản' : '4 basic braces treatment steps'}</h3>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {bracesSteps.map((step, index) => (
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
            <h3 className="text-2xl font-black text-slate-900">{isVi ? 'Chăm sóc trong quá trình niềng' : 'Care during braces treatment'}</h3>
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
            src={bracesProcessImage}
            alt={isVi ? 'Ảnh minh họa quy trình niềng răng' : 'Braces procedure illustration'}
            className="min-h-[320px] w-full rounded-2xl object-cover"
          />
          <div className="hidden min-h-[320px] flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 text-center">
            <ImagePlus className="h-10 w-10 text-slate-500" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-slate-900">{isVi ? 'Ảnh minh họa chỉnh nha' : 'Orthodontic image placeholder'}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              {isVi
                ? 'Gợi ý: thêm ảnh mắc cài cận cảnh, khay trong suốt, vệ sinh khi niềng hoặc nụ cười sau điều trị.'
                : 'Suggested: add close-up braces, clear aligners, cleaning routine, or post-treatment smile images.'}
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
