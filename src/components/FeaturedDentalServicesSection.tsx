import { getServiceDetailRoute } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { getFeaturedServicesForHome, type Service } from '@/services/serviceService';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function formatServicePriceVnd(amount: number, isVi: boolean) {
  return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FeaturedDentalServicesSection() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [services, setServices] = useState<Service[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');

    getFeaturedServicesForHome({ limit: 10, page: 1 })
      .then((res) => {
        if (cancelled) return;
        setServices(res.data.items);
        setLoadState('idle');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const count = services.length;

  const shiftFeaturedService = (step: number) => {
    if (count === 0) return;
    setActiveServiceIndex((prev) => (prev + step + count) % count);
  };

  const visibleServiceIndexes = useMemo(() => {
    if (count === 0) return [];
    return [(activeServiceIndex - 1 + count) % count, activeServiceIndex, (activeServiceIndex + 1) % count];
  }, [activeServiceIndex, count]);

  useEffect(() => {
    if (count > 0 && activeServiceIndex >= count) {
      setActiveServiceIndex(0);
    }
  }, [count, activeServiceIndex]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-sky-100/60 md:px-10 md:py-14">
      <div className="pointer-events-none absolute -left-6 top-10 h-20 w-20 rounded-full bg-white/50 blur-2xl" />
      <div className="pointer-events-none absolute -right-8 bottom-8 h-24 w-24 rounded-full bg-sky-200/50 blur-2xl" />

      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Dịch vụ nha khoa nổi bật' : 'Featured Dental Services'}
      </h2>

      {loadState === 'loading' && <p className="mt-10 text-center text-slate-600">{isVi ? 'Đang tải…' : 'Loading…'}</p>}

      {loadState === 'error' && (
        <p className="mt-10 text-center text-red-600">
          {isVi ? 'Không tải được danh sách dịch vụ.' : 'Could not load services.'}
        </p>
      )}

      {loadState !== 'loading' && loadState !== 'error' && count === 0 && (
        <p className="mt-10 text-center text-slate-600">
          {isVi ? 'Chưa có dịch vụ nổi bật.' : 'No featured services yet.'}
        </p>
      )}

      {count > 0 && (
        <div className="relative mx-auto mt-10 max-w-6xl">
          <button
            aria-label={isVi ? 'Dịch vụ trước' : 'Previous service'}
            className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-700 text-2xl text-white shadow-lg transition hover:bg-blue-800 md:grid"
            onClick={() => shiftFeaturedService(-1)}
            type="button"
          >
            &#8249;
          </button>

          <button
            aria-label={isVi ? 'Dịch vụ tiếp theo' : 'Next service'}
            className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-500 text-2xl text-white shadow-lg transition hover:bg-blue-600 md:grid"
            onClick={() => shiftFeaturedService(1)}
            type="button"
          >
            &#8250;
          </button>

          <div className="grid gap-5 md:grid-cols-3 md:px-16">
            {visibleServiceIndexes.map((itemIndex, slotIndex) => {
              const item = services[itemIndex];
              const isCenter = slotIndex === 1;
              const eyebrow = item.category?.categoryName?.trim()
                ? item.category.categoryName
                : isVi
                  ? 'Dịch vụ'
                  : 'Service';

              return (
                <Link
                  className={`group block overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isCenter ? 'md:scale-100' : 'md:translate-y-6 md:scale-[0.94] md:opacity-95'
                  }`}
                  key={`${item.serviceId}-${itemIndex}`}
                  to={getServiceDetailRoute(item.serviceId)}
                >
                  <div className="relative h-[280px] overflow-hidden bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                    {item.thumbnail?.trim() ? (
                      <img
                        src={item.thumbnail.trim()}
                        alt={item.serviceName}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-slate-300" />
                        <p className="absolute inset-0 grid place-items-center px-8 text-center text-sm font-semibold text-slate-500">
                          {isVi ? 'Chưa có ảnh dịch vụ' : 'No service image'}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="relative bg-blue-700 px-5 py-4 pb-5">
                    <p className="text-sm font-bold uppercase tracking-wide text-white/90">{eyebrow}</p>
                    <p className="text-[34px] font-black uppercase leading-tight text-yellow-300">{item.serviceName}</p>
                    <p className="mt-2 text-base font-bold tabular-nums text-white/95">
                      {isVi ? 'Giá: ' : 'Price: '}
                      {formatServicePriceVnd(item.cost, isVi)}
                    </p>
                    <span className="absolute -bottom-3 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-yellow-300 text-xs text-blue-700 shadow">
                      &#10049;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-center gap-2">
            {services.map((item, index) => (
              <button
                aria-label={`${isVi ? 'Chuyển đến' : 'Go to'} ${item.serviceName}`}
                className={`h-2.5 rounded-full transition ${index === activeServiceIndex ? 'w-8 bg-blue-700' : 'w-2.5 bg-slate-400 hover:bg-slate-500'}`}
                key={item.serviceId}
                onClick={() => setActiveServiceIndex(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
