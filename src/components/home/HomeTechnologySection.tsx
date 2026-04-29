type TechnologyItem = {
  tabLabel: string;
  title: string;
  lead: string;
  paragraphs: string[];
  highlightsTitle: string;
  highlights: string[];
  thumbnails: string[];
};

type HomeTechnologySectionProps = {
  isVi: boolean;
  technologies: TechnologyItem[];
  activeTechIndex: number;
  onSelectTech: (index: number) => void;
};

export function HomeTechnologySection({
  isVi,
  technologies,
  activeTechIndex,
  onSelectTech,
}: HomeTechnologySectionProps) {
  const activeTechnology = technologies[activeTechIndex];

  if (!activeTechnology) return null;

  return (
    <div className="rounded-[30px] border border-slate-200 bg-[#f3f5f8] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8">
      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Công nghệ hiện đại' : 'Modern Technology'}
      </h2>

      <div className="mx-auto mt-8 max-w-5xl overflow-x-auto">
        <div className="inline-flex min-w-full rounded-xl border border-blue-600 bg-white p-1">
          {technologies.map((technology, index) => {
            const isActive = index === activeTechIndex;
            return (
              <button
                className={`rounded-lg px-5 py-3 text-sm font-bold transition md:text-base ${
                  isActive ? 'bg-blue-700 text-white shadow' : 'text-slate-600 hover:bg-blue-50'
                }`}
                key={technology.title}
                onClick={() => onSelectTech(index)}
                type="button"
              >
                {technology.tabLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[86px_1fr_1fr]">
        <div className="grid grid-cols-5 gap-3 lg:grid-cols-1">
          {activeTechnology.thumbnails.map((thumb) => (
            <button
              key={thumb}
              type="button"
              className="group relative h-[78px] overflow-hidden rounded-xl border border-blue-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              <span className="absolute inset-0 bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
              <span className="absolute inset-0 grid place-items-center px-2 text-center text-xs font-semibold text-slate-500 group-hover:text-slate-700">
                {thumb}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative grid min-h-[420px] place-items-center overflow-hidden rounded-xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
            <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-slate-300" />
            <p className="relative z-10 px-6 text-center text-base font-semibold text-slate-500">
              {isVi ? 'Ảnh công nghệ sẽ bổ sung sau' : 'Technology image will be added later'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-2xl font-black text-blue-700">{activeTechnology.title}</h3>
          <p className="mt-3 text-base leading-7 text-slate-700">{activeTechnology.lead}</p>
          <div className="mt-4 max-h-[315px] space-y-4 overflow-y-auto pr-2 text-base leading-8 text-slate-700">
            {activeTechnology.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <p className="pt-1 text-xl font-black text-blue-700">{activeTechnology.highlightsTitle}</p>
            <ul className="list-disc space-y-2 pl-6">
              {activeTechnology.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
