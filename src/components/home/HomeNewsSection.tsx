import parse from 'html-react-parser';

type HomeNewsItem = {
  postId: number;
  title: string;
  excerpt: string;
  date: string;
  thumbnail: string | null;
};

type HomeNewsSectionProps = {
  isVi: boolean;
  newsLoading: boolean;
  newsError: string | null;
  featuredNews: HomeNewsItem[];
  sideNews: HomeNewsItem[];
  newsTabs: string[];
  activeNewsTab: number;
  onSelectNewsTab: (index: number) => void;
};

export function HomeNewsSection({
  isVi,
  newsLoading,
  newsError,
  featuredNews,
  sideNews,
  newsTabs,
  activeNewsTab,
  onSelectNewsTab,
}: HomeNewsSectionProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Tin tức - Ưu đãi' : 'News - Promotions'}
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.95fr_0.95fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {newsLoading ? (
            <p className="col-span-2 text-center text-base text-slate-600">
              {isVi ? 'Đang tải tin tức...' : 'Loading news...'}
            </p>
          ) : newsError ? (
            <p className="col-span-2 text-center text-base text-red-600">{newsError}</p>
          ) : featuredNews.length === 0 ? (
            <p className="col-span-2 text-center text-base text-slate-600">
              {isVi ? 'Chưa có bài viết phù hợp.' : 'No matching posts yet.'}
            </p>
          ) : (
            featuredNews.map((item) => (
              <article
                key={item.postId}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60"
              >
                <div className="relative grid h-[320px] place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                  {item.thumbnail ? (
                    <img alt={item.title} className="h-full w-full object-cover" src={item.thumbnail} />
                  ) : (
                    <>
                      <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-slate-300" />
                      <p className="relative z-10 px-6 text-center text-sm font-semibold text-slate-500">
                        {isVi ? 'Ảnh tin tức sẽ bổ sung sau' : 'News image will be added later'}
                      </p>
                    </>
                  )}
                </div>

                <h3 className="mt-4 text-2xl font-black leading-tight text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{item.date}</p>
                <div className="mt-3 h-px w-10 bg-slate-300" />
                <div className="mt-3 text-base leading-8 text-slate-700">{parse(item.excerpt)}</div>
              </article>
            ))
          )}
        </div>

        <aside className="rounded-3xl bg-blue-700 p-4 text-white shadow-lg shadow-blue-700/30">
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-blue-800/80 p-1">
            {newsTabs.map((tab, index) => (
              <button
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  index === activeNewsTab ? 'bg-white text-blue-700' : 'text-white/90 hover:bg-blue-600'
                }`}
                key={tab}
                onClick={() => onSelectNewsTab(index)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4 max-h-[580px] space-y-3 overflow-y-auto pr-1">
            {sideNews.map((item) => (
              <button
                className="grid w-full grid-cols-[108px_1fr] gap-3 rounded-xl p-2 text-left transition hover:bg-blue-600/70"
                key={item.postId}
                type="button"
              >
                {item.thumbnail ? (
                  <img
                    alt={item.title}
                    className="h-[70px] w-full overflow-hidden rounded-lg object-cover"
                    src={item.thumbnail}
                  />
                ) : (
                  <div className="grid h-[70px] place-items-center overflow-hidden rounded-lg bg-white/90 text-xs font-semibold text-slate-500">
                    {isVi ? 'Ảnh nhỏ' : 'Thumb'}
                  </div>
                )}
                <div className="self-center">
                  <p className="line-clamp-2 text-2xl font-bold leading-tight">{item.title}</p>
                  <p className="mt-1 text-sm text-white/80">{item.date}</p>
                  <div className="mt-2 h-px w-10 bg-white/35" />
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
