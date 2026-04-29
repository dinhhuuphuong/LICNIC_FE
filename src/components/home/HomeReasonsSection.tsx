type ReasonItem = {
  number: string;
  title: string;
  description: string;
};

type HomeReasonsSectionProps = {
  isVi: boolean;
  aboutImageSrc: string;
  leftReasons: ReasonItem[];
  rightReasons: ReasonItem[];
};

export function HomeReasonsSection({ isVi, aboutImageSrc, leftReasons, rightReasons }: HomeReasonsSectionProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
      <p className="text-center text-sm font-medium text-blue-600">
        {isVi ? 'Lý do khách hàng tin chọn' : 'Why customers choose us'}
      </p>
      <h2 className="mt-2 text-center text-4xl font-black text-blue-700 md:text-5xl">
        {isVi ? 'NHA KHOA TẬN TÂM' : 'TAN TAM DENTAL'}
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr]">
        <div className="space-y-6">
          {leftReasons.map((item) => (
            <article className="text-center lg:text-left" key={item.number}>
              <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                {item.number}
              </span>
              <h3 className="mt-3 text-2xl font-bold text-blue-700">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <img alt={isVi ? 'Về chúng tôi' : 'About us'} className="w-full max-w-md" src={aboutImageSrc} />
        </div>

        <div className="space-y-6">
          {rightReasons.map((item) => (
            <article className="text-center lg:text-left" key={item.number}>
              <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                {item.number}
              </span>
              <h3 className="mt-3 text-2xl font-bold text-blue-700">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
