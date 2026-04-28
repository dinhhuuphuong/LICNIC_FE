import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { ReceptionistReviewTable } from '@/components/receptionists/reviews';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getReceptionistReviews } from '@/services/reviewService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function toPositiveOrUndefined(value?: number | null) {
  if (!value || value < 1) return undefined;
  return value;
}

export function QuanLyReviewLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useQueryParams({
    patientId: NumberParam,
    doctorId: NumberParam,
    appointmentId: NumberParam,
    status: StringParam,
    page: NumberParam,
    limit: NumberParam,
  });

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const patientId = toPositiveOrUndefined(query.patientId);
  const doctorId = toPositiveOrUndefined(query.doctorId);
  const appointmentId = toPositiveOrUndefined(query.appointmentId);
  const status = query.status && ['pending', 'approved', 'rejected'].includes(query.status) ? query.status : undefined;

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý review' : 'NHA KHOA TAN TAM | Review management');

  const reviewsQuery = useQuery({
    queryKey: [
      'receptionistReviews',
      patientId ?? 'all',
      doctorId ?? 'all',
      appointmentId ?? 'all',
      status ?? 'all',
      page,
      limit,
    ],
    queryFn: () =>
      getReceptionistReviews({
        page,
        limit,
        ...(patientId ? { patientId } : {}),
        ...(doctorId ? { doctorId } : {}),
        ...(appointmentId ? { appointmentId } : {}),
        ...(status ? { status: status as 'pending' | 'approved' | 'rejected' } : {}),
      }),
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.RECEPTIONIST.toLowerCase(),
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để quản lý review.' : 'Please sign in to manage reviews.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.RECEPTIONIST.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản lễ tân.' : 'This page is only available for receptionist accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <header className="mb-2">
          <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Quản lý review' : 'Review management'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isVi
              ? 'Theo dõi và tra cứu đánh giá của bệnh nhân theo bác sĩ/lịch hẹn.'
              : 'Track and search patient reviews by doctor or appointment.'}
          </p>
        </header>

        {/* <ReceptionistReviewFilters
          isVi={isVi}
          patientId={patientId}
          doctorId={doctorId}
          appointmentId={appointmentId}
          status={status}
          onChangePatientId={(value) => {
            void setQuery({ ...query, patientId: value, page: 1 });
          }}
          onChangeDoctorId={(value) => {
            void setQuery({ ...query, doctorId: value, page: 1 });
          }}
          onChangeAppointmentId={(value) => {
            void setQuery({ ...query, appointmentId: value, page: 1 });
          }}
          onChangeStatus={(value) => {
            void setQuery({ ...query, status: value, page: 1 });
          }}
          onClear={() => {
            void setQuery({
              patientId: undefined,
              doctorId: undefined,
              appointmentId: undefined,
              status: undefined,
              page: 1,
              limit,
            });
          }}
        /> */}
      </div>

      {reviewsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message={
            reviewsQuery.error instanceof Error
              ? reviewsQuery.error.message
              : isVi
                ? 'Tải danh sách review thất bại.'
                : 'Load failed.'
          }
        />
      ) : null}

      <PageCard>
        <ReceptionistReviewTable
          isVi={isVi}
          loading={reviewsQuery.isLoading}
          reviews={reviewsQuery.data?.data.items ?? []}
          page={reviewsQuery.data?.data.page ?? page}
          limit={reviewsQuery.data?.data.limit ?? limit}
          total={reviewsQuery.data?.data.total ?? 0}
          onReviewUpdated={reviewsQuery.refetch}
          onChangePage={(nextPage, nextLimit) => {
            void setQuery({
              patientId,
              doctorId,
              appointmentId,
              status,
              page: nextPage,
              limit: nextLimit,
            });
          }}
        />
      </PageCard>
    </div>
  );
}
