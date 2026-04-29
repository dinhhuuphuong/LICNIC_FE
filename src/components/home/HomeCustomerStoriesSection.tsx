type CustomerStoryItem = {
  reviewId: number;
  customer: string;
  avatar: string | null;
  headline: string;
  excerpt: string;
};

type HomeCustomerStoriesSectionProps = {
  isVi: boolean;
  reviewsLoading: boolean;
  reviewsError: string | null;
  visibleStories: CustomerStoryItem[];
  totalStoryPages: number;
  activeStoryPage: number;
  onShiftStoryPage: (step: number) => void;
  onSelectStoryPage: (index: number) => void;
};

export function HomeCustomerStoriesSection({
  isVi,
  reviewsLoading,
  reviewsError,
  visibleStories,
  totalStoryPages,
  activeStoryPage,
  onShiftStoryPage,
  onSelectStoryPage,
}: HomeCustomerStoriesSectionProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Câu chuyện khách hàng' : 'Customer Stories'}
      </h2>

      <div className="relative mt-8">
        <button
          aria-label={isVi ? 'Nhóm trước' : 'Previous group'}
          className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-500 text-2xl text-white shadow transition hover:bg-blue-600 lg:grid"
          onClick={() => onShiftStoryPage(-1)}
          type="button"
        >
          &#8249;
        </button>

        <button
          aria-label={isVi ? 'Nhóm tiếp theo' : 'Next group'}
          className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-700 text-2xl text-white shadow transition hover:bg-blue-800 lg:grid"
          onClick={() => onShiftStoryPage(1)}
          type="button"
        >
          &#8250;
        </button>

        {reviewsLoading ? (
          <p className="py-6 text-center text-base text-slate-600">
            {isVi ? 'Dang tai danh gia khach hang...' : 'Loading customer reviews...'}
          </p>
        ) : reviewsError ? (
          <p className="py-6 text-center text-base text-red-600">{reviewsError}</p>
        ) : visibleStories.length === 0 ? (
          <p className="py-6 text-center text-base text-slate-600">
            {isVi ? 'Chua co danh gia duoc duyet.' : 'No approved reviews yet.'}
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3 lg:px-10">
            {visibleStories.map((story) => (
              <article
                key={story.reviewId}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60"
              >
                <div className="relative grid h-[280px] place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                  {story.avatar ? (
                    <img alt={story.customer} className="h-full w-full object-cover" src={story.avatar} />
                  ) : (
                    <>
                      <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-slate-300" />
                      <p className="relative z-10 px-6 text-center text-sm font-semibold text-slate-500">
                        {isVi ? 'Anh khach hang se bo sung sau' : 'Customer image will be added later'}
                      </p>
                    </>
                  )}
                </div>

                <h3 className="mt-5 text-2xl font-black text-blue-700">
                  {isVi ? `Khach hang: ${story.customer}` : `Customer: ${story.customer}`}
                </h3>
                <p className="mt-1 text-lg font-bold text-slate-800">{story.headline}</p>
                <p className="mt-3 line-clamp-3 text-base leading-8 text-slate-700">
                  {story.excerpt || (isVi ? 'Khach hang khong de lai noi dung.' : 'No comment provided.')}
                </p>

                <div className="pt-6 text-center">
                  <button
                    className="inline-flex items-center rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-800"
                    type="button"
                  >
                    {isVi ? 'Xem chi tiet' : 'View details'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalStoryPages }).map((_, pageIndex) => (
            <button
              aria-label={`${isVi ? 'Đến nhóm' : 'Go to group'} ${pageIndex + 1}`}
              className={`h-2.5 rounded-full transition ${
                pageIndex === activeStoryPage ? 'w-8 bg-blue-700' : 'w-2.5 bg-slate-400 hover:bg-slate-500'
              }`}
              key={pageIndex}
              onClick={() => onSelectStoryPage(pageIndex)}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
