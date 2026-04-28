import RangePickerParam from '@/components/common/date-pickers/range-picker-param';
import SelectParam from '@/components/common/selects/select-param';
import { StatePanel } from '@/components/common/StatePanel';
import DATE_FORMAT from '@/constants/date-format';
import { DOCTOR_ROLE_ID } from '@/constants/roleIds';
import { ROUTES } from '@/constants/routes';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  getDoctorWorkDaysGrouped,
  getExaminedPatientsGrouped,
  getPrescriptionsGrouped,
  type GetDoctorWorkDaysGroupedParams,
  type GetExaminedPatientsGroupedParams,
  type GetPrescriptionsGroupedParams,
} from '@/services/statisticsService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { Flex, Grid, Typography } from 'antd';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DoctorExaminedPatientsChartCard } from '../components/doctor/dashboard/DoctorExaminedPatientsChartCard';
import { DoctorPrescriptionsChartCard } from '../components/doctor/dashboard/DoctorPrescriptionsChartCard';
import { DoctorWorkDaysChartCard } from '../components/doctor/dashboard/DoctorWorkDaysChartCard';

dayjs.extend(customParseFormat);
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type DoctorDashboardGroupBy = 'month' | 'quarter' | 'year';

const groupByOptions = [
  { label: 'Tháng', value: 'month' },
  { label: 'Quý', value: 'quarter' },
  { label: 'Năm', value: 'year' },
];

function formatPeriod(period: string, groupBy: DoctorDashboardGroupBy) {
  if (groupBy === 'month') {
    return dayjs(period, DATE_FORMAT.MONTH_YEAR_DB, true).isValid()
      ? dayjs(period, DATE_FORMAT.MONTH_YEAR_DB).format(DATE_FORMAT.MONTH_YEAR)
      : period;
  }

  if (groupBy === 'quarter') {
    const quarterMatch = period.match(/^(\d{4})-Q([1-4])$/);
    if (quarterMatch) {
      return `Q${quarterMatch[2]}/${quarterMatch[1]}`;
    }
  }

  return period;
}

export function DashboardBacSiPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [searchParams] = useSearchParams();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  useDocumentTitle('NHA KHOA TẬN TÂM | Dashboard bác sĩ');

  const groupByParam = searchParams.get(SEARCH_PARAMS.DATE_MODE);
  const fromDate = searchParams.get(SEARCH_PARAMS.FROM_DATE) || dayjs().startOf('month').format(DATE_FORMAT.DB_DATE);
  const toDate = searchParams.get(SEARCH_PARAMS.TO_DATE) || dayjs().endOf('month').format(DATE_FORMAT.DB_DATE);

  const groupBy: DoctorDashboardGroupBy =
    groupByParam === 'quarter' || groupByParam === 'year' || groupByParam === 'month' ? groupByParam : 'month';

  const workDaysQueryParams: GetDoctorWorkDaysGroupedParams = useMemo(
    () => ({
      fromDate,
      toDate,
      groupBy,
      page: 1,
      limit: 100,
    }),
    [fromDate, groupBy, toDate],
  );

  const examinedPatientsQueryParams: GetExaminedPatientsGroupedParams = useMemo(
    () => ({
      fromDate,
      toDate,
      groupBy,
      page: 1,
      limit: 100,
    }),
    [fromDate, groupBy, toDate],
  );

  const prescriptionsQueryParams: GetPrescriptionsGroupedParams = useMemo(
    () => ({
      fromDate,
      toDate,
      groupBy,
      page: 1,
      limit: 100,
    }),
    [fromDate, groupBy, toDate],
  );

  const {
    data: workDaysData,
    isFetching: isFetchingWorkDays,
    isError: isWorkDaysError,
    error: workDaysError,
  } = useQuery({
    queryKey: ['doctor-dashboard', 'work-days-grouped', fromDate, toDate, groupBy, 1, 100],
    queryFn: () => getDoctorWorkDaysGrouped(workDaysQueryParams),
    enabled: Boolean(fromDate && toDate) && user?.roleId === DOCTOR_ROLE_ID,
  });

  const {
    data: examinedPatientsData,
    isFetching: isFetchingExaminedPatients,
    isError: isExaminedPatientsError,
    error: examinedPatientsError,
  } = useQuery({
    queryKey: ['doctor-dashboard', 'examined-patients-grouped', fromDate, toDate, groupBy, 1, 100],
    queryFn: () => getExaminedPatientsGrouped(examinedPatientsQueryParams),
    enabled: Boolean(fromDate && toDate) && user?.roleId === DOCTOR_ROLE_ID,
  });

  const {
    data: prescriptionsData,
    isFetching: isFetchingPrescriptions,
    isError: isPrescriptionsError,
    error: prescriptionsError,
  } = useQuery({
    queryKey: ['doctor-dashboard', 'prescriptions-grouped', fromDate, toDate, groupBy, 1, 100],
    queryFn: () => getPrescriptionsGrouped(prescriptionsQueryParams),
    enabled: Boolean(fromDate && toDate) && user?.roleId === DOCTOR_ROLE_ID,
  });

  const workDaysItems = useMemo(() => workDaysData?.data.items ?? [], [workDaysData]);
  const examinedPatientsItems = useMemo(() => examinedPatientsData?.data.items ?? [], [examinedPatientsData]);
  const prescriptionsItems = useMemo(() => prescriptionsData?.data.items ?? [], [prescriptionsData]);

  const workDaysChartData = useMemo(() => {
    return {
      labels: workDaysItems.map((item) => formatPeriod(item.period, groupBy)),
      datasets: [
        {
          label: 'Số ngày làm',
          data: workDaysItems.map((item) => item.workDays),
          backgroundColor: 'rgba(59, 130, 246, 0.65)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: isMobile ? 24 : 40,
          barThickness: 'flex' as const,
        },
      ],
    };
  }, [groupBy, isMobile, workDaysItems]);

  const examinedPatientsChartData = useMemo(() => {
    return {
      labels: examinedPatientsItems.map((item) => formatPeriod(item.period, groupBy)),
      datasets: [
        {
          label: 'Số bệnh nhân đã khám',
          data: examinedPatientsItems.map((item) => item.patientCount),
          backgroundColor: 'rgba(34, 197, 94, 0.65)',
          borderColor: 'rgba(22, 163, 74, 1)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: isMobile ? 24 : 40,
          barThickness: 'flex' as const,
        },
      ],
    };
  }, [examinedPatientsItems, groupBy, isMobile]);

  const prescriptionsChartData = useMemo(() => {
    return {
      labels: prescriptionsItems.map((item) => formatPeriod(item.period, groupBy)),
      datasets: [
        {
          label: 'Số dòng thuốc đã kê',
          data: prescriptionsItems.map((item) => item.prescriptionCount),
          backgroundColor: 'rgba(168, 85, 247, 0.65)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: isMobile ? 24 : 40,
          barThickness: 'flex' as const,
        },
      ],
    };
  }, [groupBy, isMobile, prescriptionsItems]);

  const workDaysChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: isMobile ? 10 : 12,
            font: { size: isMobile ? 11 : 12 },
          },
        },
        tooltip: {
          callbacks: {
            title: (ctx) => {
              const i = ctx[0]?.dataIndex;
              if (i === undefined) return '';
              return workDaysItems[i]?.period ?? '';
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            maxTicksLimit: isMobile ? 6 : 12,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            maxTicksLimit: isMobile ? 6 : 8,
          },
        },
      },
    }),
    [isMobile, workDaysItems],
  );

  const examinedPatientsChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: isMobile ? 10 : 12,
            font: { size: isMobile ? 11 : 12 },
          },
        },
        tooltip: {
          callbacks: {
            title: (ctx) => {
              const i = ctx[0]?.dataIndex;
              if (i === undefined) return '';
              return examinedPatientsItems[i]?.period ?? '';
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            maxTicksLimit: isMobile ? 6 : 12,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            maxTicksLimit: isMobile ? 6 : 8,
          },
        },
      },
    }),
    [examinedPatientsItems, isMobile],
  );

  const prescriptionsChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: isMobile ? 10 : 12,
            font: { size: isMobile ? 11 : 12 },
          },
        },
        tooltip: {
          callbacks: {
            title: (ctx) => {
              const i = ctx[0]?.dataIndex;
              if (i === undefined) return '';
              return prescriptionsItems[i]?.period ?? '';
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            maxTicksLimit: isMobile ? 6 : 12,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            maxTicksLimit: isMobile ? 6 : 8,
          },
        },
      },
    }),
    [isMobile, prescriptionsItems],
  );

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title="Cần đăng nhập"
        description="Vui lòng đăng nhập để xem dashboard bác sĩ."
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            Đăng nhập
          </button>
        }
      />
    );
  }

  if (user.roleId !== DOCTOR_ROLE_ID) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title="Không có quyền truy cập"
        description="Trang này chỉ dành cho tài khoản bác sĩ."
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            Về trang chủ
          </button>
        }
      />
    );
  }

  return (
    <Flex vertical gap={16} className="w-full">
      <Flex justify="space-between" align="center" gap={8} wrap className="w-full">
        <div className="min-w-0">
          <Typography.Title level={4} className="mb-0!">
            Dashboard bác sĩ
          </Typography.Title>
        </div>
        <Flex gap={8} wrap className="w-full sm:w-auto">
          <SelectParam
            className="w-full sm:w-[110px]"
            defaultValue={groupBy}
            options={groupByOptions}
            param={SEARCH_PARAMS.DATE_MODE}
            showSearch={false}
          />
          <div className="w-full sm:w-auto [&_.ant-picker]:w-full sm:[&_.ant-picker]:min-w-[280px]">
            <RangePickerParam
              dbFormat={DATE_FORMAT.DB_DATE}
              defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
            />
          </div>
        </Flex>
      </Flex>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DoctorWorkDaysChartCard
          isFetching={isFetchingWorkDays}
          isError={isWorkDaysError}
          errorMessage={(workDaysError as Error)?.message}
          itemsLength={workDaysItems.length}
          chartData={workDaysChartData}
          chartOptions={workDaysChartOptions}
        />

        <DoctorExaminedPatientsChartCard
          isFetching={isFetchingExaminedPatients}
          isError={isExaminedPatientsError}
          errorMessage={(examinedPatientsError as Error)?.message}
          itemsLength={examinedPatientsItems.length}
          chartData={examinedPatientsChartData}
          chartOptions={examinedPatientsChartOptions}
        />

        <DoctorPrescriptionsChartCard
          isFetching={isFetchingPrescriptions}
          isError={isPrescriptionsError}
          errorMessage={(prescriptionsError as Error)?.message}
          itemsLength={prescriptionsItems.length}
          chartData={prescriptionsChartData}
          chartOptions={prescriptionsChartOptions}
        />
      </div>
    </Flex>
  );
}
