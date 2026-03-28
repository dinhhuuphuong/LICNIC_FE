import { ServiceBookingWizard } from '@/components/ServiceBookingWizard';
import { ROUTES, getServiceDetailRoute } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getServiceDetailOrNull, type Service } from '@/services/serviceService';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type LoadState = 'idle' | 'loading' | 'error' | 'notFound';

export function DatLichDichVuPage() {
  const { serviceId: serviceIdParam } = useParams<{ serviceId: string }>();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const serviceId = Number(serviceIdParam);
  const idValid = Number.isInteger(serviceId) && serviceId > 0;

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [service, setService] = useState<Service | null>(null);

  useDocumentTitle(
    service
      ? `NHA KHOA TẬN TÂM | ${isVi ? 'Đặt lịch' : 'Book'} — ${service.serviceName}`
      : isVi
        ? 'NHA KHOA TẬN TÂM | Đặt lịch'
        : 'NHA KHOA TẬN TÂM | Book appointment',
  );

  useEffect(() => {
    if (!idValid) {
      setLoadState('notFound');
      setService(null);
      return;
    }

    let cancelled = false;
    setLoadState('loading');
    setService(null);

    getServiceDetailOrNull(serviceId)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          setLoadState('notFound');
          return;
        }
        setService(res.data);
        setLoadState('idle');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [idValid, serviceId]);

  return (
    <div className="mx-auto max-w-[1360px]">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-600">
        <Link className="font-medium text-blue-700 underline-offset-4 hover:underline" to={ROUTES.home}>
          {isVi ? 'Trang chủ' : 'Home'}
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        {idValid ? (
          <Link
            className="font-medium text-blue-700 underline-offset-4 hover:underline"
            to={getServiceDetailRoute(serviceId)}
          >
            {isVi ? 'Dịch vụ' : 'Service'}
          </Link>
        ) : (
          <span className="text-slate-600">{isVi ? 'Dịch vụ' : 'Service'}</span>
        )}
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-800">{isVi ? 'Đặt lịch' : 'Booking'}</span>
      </nav>

      {loadState === 'loading' && (
        <div
          className="animate-pulse space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg"
          aria-busy="true"
          aria-label={isVi ? 'Đang tải' : 'Loading'}
        >
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-100" />
        </div>
      )}

      {loadState === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-semibold">
            {isVi ? 'Không tải được thông tin dịch vụ.' : 'Could not load service details.'}
          </p>
          <Link
            className="mt-4 inline-block font-bold text-blue-700 underline-offset-4 hover:underline"
            to={ROUTES.home}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </Link>
        </div>
      )}

      {loadState === 'notFound' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <p className="text-lg font-bold text-slate-800">{isVi ? 'Không tìm thấy dịch vụ.' : 'Service not found.'}</p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
            to={ROUTES.home}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </Link>
        </div>
      )}

      {loadState === 'idle' && service && !service.status && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-semibold">
            {isVi ? 'Dịch vụ này hiện không mở đặt lịch.' : 'This service is not available for booking.'}
          </p>
          <Link className="mt-3 inline-block font-bold text-blue-800 underline" to={getServiceDetailRoute(serviceId)}>
            {isVi ? '← Quay lại chi tiết' : '← Back to details'}
          </Link>
        </div>
      )}

      {loadState === 'idle' && service && service.status ? (
        <ServiceBookingWizard serviceId={service.serviceId} serviceName={service.serviceName} isVi={isVi} />
      ) : null}
    </div>
  );
}
