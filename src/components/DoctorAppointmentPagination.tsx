import DATE_FORMAT from '@/constants/date-format';
import { ROUTES } from '@/constants/routes';
import { SEARCH_PARAMS } from '@/constants/search-params';
import dayjs from 'dayjs';

type DoctorAppointmentPaginationProps = {
  isVi: boolean;
  currentPage: number;
  totalPages: number;
  fromDate?: string;
  toDate?: string;
  onNavigate: (url: string) => void;
};

function buildPageUrl(nextPage: number, fromDate: string | undefined, toDate: string | undefined) {
  const params = new URLSearchParams(window.location.search);
  params.set('page', String(nextPage));
  if (!fromDate) params.set(SEARCH_PARAMS.FROM_DATE, dayjs().startOf('month').format(DATE_FORMAT.DB_DATE));
  if (!toDate) params.set(SEARCH_PARAMS.TO_DATE, dayjs().endOf('month').format(DATE_FORMAT.DB_DATE));
  return `${ROUTES.doctorAppointments}?${params.toString()}`;
}

export function DoctorAppointmentPagination({
  isVi,
  currentPage,
  totalPages,
  fromDate,
  toDate,
  onNavigate,
}: DoctorAppointmentPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-slate-600">
        {isVi ? 'Trang' : 'Page'} {currentPage} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onNavigate(buildPageUrl(currentPage - 1, fromDate, toDate))}
        >
          {isVi ? 'Trang trước' : 'Previous'}
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => onNavigate(buildPageUrl(currentPage + 1, fromDate, toDate))}
        >
          {isVi ? 'Trang sau' : 'Next'}
        </button>
      </div>
    </div>
  );
}
