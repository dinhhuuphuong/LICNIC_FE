import type { Service } from '@/services/serviceService';

type Props = {
  service: Service;
  isVi: boolean;
};

function formatPriceVnd(amount: number | null | undefined, isVi: boolean) {
  if (amount == null || Number.isNaN(amount)) {
    return isVi ? 'Liên hệ' : 'Contact us';
  }
  return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function DetailBlock({ title, body }: { title: string; body: string | null | undefined }) {
  const text = body?.trim();
  if (!text) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-lg font-bold text-blue-700 md:text-xl">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 md:text-base">{text}</p>
    </section>
  );
}

export function ServiceDetailContent({ service, isVi }: Props) {
  const eyebrow = service.category?.categoryName?.trim() ? service.category.categoryName : isVi ? 'Dịch vụ' : 'Service';

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="relative h-[220px] overflow-hidden bg-linear-to-br from-slate-100 via-slate-200 to-slate-100 md:h-[320px]">
        {service.thumbnail?.trim() ? (
          <img src={service.thumbnail.trim()} alt={service.serviceName} className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-6 rounded-2xl border-2 border-dashed border-slate-300" />
            <p className="absolute inset-0 grid place-items-center px-8 text-center text-sm font-semibold text-slate-500">
              {isVi ? 'Chưa có ảnh dịch vụ' : 'No service image'}
            </p>
          </>
        )}
        {!service.status && (
          <div className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow">
            {isVi ? 'Tạm ngưng' : 'Unavailable'}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-blue-700 px-5 py-6 md:px-8 md:py-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/85 md:text-sm">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black uppercase leading-tight text-yellow-300 md:text-4xl">
          {service.serviceName}
        </h1>
        <p className="mt-3 text-base font-bold tabular-nums text-white md:text-lg">
          {isVi ? 'Giá: ' : 'Price: '}
          {formatPriceVnd(service.cost, isVi)}
        </p>
      </div>

      <div className="space-y-4 bg-[#f4f8fc] p-5 md:space-y-5 md:p-8">
        <DetailBlock title={isVi ? 'Dịch vụ là gì?' : 'What is this service?'} body={service.whatIs} />
        <DetailBlock title={isVi ? 'Phương pháp thực hiện' : 'Method'} body={service.method} />
        <DetailBlock title={isVi ? 'Quy trình' : 'Process'} body={service.process} />
        <DetailBlock title={isVi ? 'Địa chỉ tin cậy' : 'Trusted address'} body={service.trustedAddress} />
      </div>
    </article>
  );
}
