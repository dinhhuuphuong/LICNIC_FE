import { ServiceDetailContent } from '@/components/ServiceDetailContent';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getServiceDetailOrNull, type Service } from '@/services/serviceService';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type LoadState = 'idle' | 'loading' | 'error' | 'notFound';

export function ServiceDetailPage() {
  const { serviceId: serviceIdParam } = useParams<{ serviceId: string }>();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const serviceId = Number(serviceIdParam);
  const idValid = Number.isInteger(serviceId) && serviceId > 0;

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [service, setService] = useState<Service | null>(null);

  useDocumentTitle(
    service
      ? `NHA KHOA TẬN TÂM | ${service.serviceName}`
      : isVi
        ? 'NHA KHOA TẬN TÂM | Chi tiết dịch vụ'
        : 'NHA KHOA TẬN TÂM | Service details',
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
        <span className="text-slate-800">{isVi ? 'Dịch vụ' : 'Service'}</span>
      </nav>

      {loadState === 'loading' && (
        <div
          className="animate-pulse space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg"
          aria-busy="true"
          aria-label={isVi ? 'Đang tải' : 'Loading'}
        >
          <div className="h-48 rounded-2xl bg-slate-200 md:h-64" />
          <div className="h-24 rounded-xl bg-blue-100" />
          <div className="h-32 rounded-xl bg-slate-100" />
          <div className="h-32 rounded-xl bg-slate-100" />
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
          <p className="mt-2 text-sm text-slate-600">
            {isVi ? 'Mã dịch vụ không hợp lệ hoặc đã được gỡ bỏ.' : 'The service ID is invalid or no longer available.'}
          </p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
            to={ROUTES.home}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </Link>
        </div>
      )}

      {loadState === 'idle' && service && (
        <>
          <ServiceDetailContent service={service} isVi={isVi} />
          <div className="mt-8 flex justify-center">
            <Link
              className="inline-flex items-center justify-center rounded-full border-2 border-blue-700 bg-white px-6 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              to={ROUTES.home}
            >
              {isVi ? '← Về trang chủ' : '← Back to home'}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
