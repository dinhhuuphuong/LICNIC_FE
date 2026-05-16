import { useEffect, useState } from 'react';

type TechnologyThumbnail = {
  label: string;
  imageSrc: string;
};

type TechnologyItem = {
  tabLabel: string;
  title: string;
  lead: string;
  paragraphs: string[];
  highlightsTitle: string;
  highlights: string[];
  imageSrc: string;
  thumbnails: TechnologyThumbnail[];
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [activeTechIndex]);

  if (!activeTechnology) return null;

  const activeImage = activeTechnology.thumbnails[activeImageIndex] ?? {
    label: activeTechnology.title,
    imageSrc: activeTechnology.imageSrc,
  };

  return (
    <div className="rounded-[30px] border border-slate-200 bg-[#f3f5f8] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8">
      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Công nghệ hiện đại' : 'Modern Technology'}
      </h2>

      <div className="mx-auto mt-8 max-w-5xl overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-4 rounded-xl border border-blue-600 bg-white p-1">
          {technologies.map((technology, index) => {
            const isActive = index === activeTechIndex;
            return (
              <button
                className={`w-full rounded-lg px-5 py-3 text-center text-sm font-bold transition md:text-base ${
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
          {activeTechnology.thumbnails.map((thumb, index) => {
            const isActiveImage = index === activeImageIndex;
            return (
            <button
              key={`${thumb.label}-${thumb.imageSrc}`}
              type="button"
              className={`group relative h-[78px] overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow ${
                isActiveImage ? 'border-blue-600 ring-2 ring-blue-100' : 'border-blue-200'
              }`}
              onClick={() => setActiveImageIndex(index)}
            >
              <img
                alt={thumb.label}
                className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
                src={thumb.imageSrc}
                title={thumb.label}
              />
            </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
            <img
              alt={activeImage.label}
              className="absolute inset-0 h-full w-full object-contain p-4"
              src={activeImage.imageSrc}
            />
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
