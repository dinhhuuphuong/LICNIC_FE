type QuickActionItem = {
  icon: string;
  title: string;
  description: string;
};

type HomeHeroSectionProps = {
  isVi: boolean;
  bannerSrc: string;
  quickActions: QuickActionItem[];
};

export function HomeHeroSection({ isVi, bannerSrc, quickActions }: HomeHeroSectionProps) {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-slate-200 bg-white shadow-xl shadow-slate-200/80">
      <img
        alt={isVi ? 'Banner nha khoa' : 'Dental banner'}
        className="h-[320px] w-full object-cover md:h-[400px] lg:h-[460px]"
        src={bannerSrc}
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
                <strong className="block text-2xl font-bold text-blue-700">{item.title}</strong>
                <span className="text-sm text-slate-600">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
