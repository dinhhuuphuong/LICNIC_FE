import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Flex, Modal, Spin, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { ChartData, ChartDataset, ChartOptions } from 'chart.js';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import DATE_FORMAT from '@/constants/date-format';
import { getAppointments, type AppointmentListItem } from '@/services/appointmentService';
import type { AppointmentGroupBy } from '@/services/statisticsService';

import useDashboardParams from '../hooks/common/use-dashboard-params';
import { useGetTopDoctorsByAppointmentsGroupedQuery } from '../hooks/queries/useGetTopDoctorsByAppointmentsGroupedQuery';
import { revenuePeriodToPaidDateRange } from '../utils/revenue-period-to-paid-date-range';

dayjs.extend(customParseFormat);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DOCTOR_BAR_COLORS = [
  'rgba(22, 119, 255, 0.75)',
  'rgba(22, 163, 74, 0.75)',
  'rgba(234, 179, 8, 0.75)',
  'rgba(168, 85, 247, 0.75)',
  'rgba(236, 72, 153, 0.75)',
  'rgba(14, 165, 233, 0.75)',
  'rgba(249, 115, 22, 0.75)',
  'rgba(100, 116, 139, 0.75)',
];

function formatPeriodLabel(period: string, groupBy: AppointmentGroupBy): string {
  switch (groupBy) {
    case 'day':
      return dayjs(period).format(DATE_FORMAT.DATE);
    case 'week':
      return period;
    case 'month':
      return dayjs(period, DATE_FORMAT.MONTH_YEAR_DB, true).isValid()
        ? dayjs(period, DATE_FORMAT.MONTH_YEAR_DB).format(DATE_FORMAT.MONTH_YEAR)
        : period;
    case 'year':
      return period;
    default:
      return period;
  }
}

const APPOINTMENT_STATUS_VI: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  checked_in: 'Đã check-in',
};

const DETAIL_PAGE_SIZE = 10;

type SelectedPeriod = {
  period: string;
  chartTotalAppointments: number;
};

export default function TopDoctorsGroupedChart() {
  const params = useDashboardParams();
  const groupBy = params.groupBy;

  const { data, isFetching, isError, error } = useGetTopDoctorsByAppointmentsGroupedQuery(params);

  const items = useMemo(() => data?.data.items ?? [], [data]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const dateRange = useMemo(
    () => (selectedPeriod ? revenuePeriodToPaidDateRange(selectedPeriod.period, groupBy) : null),
    [selectedPeriod, groupBy],
  );

  const {
    data: appointmentsRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: [
      'adminDashboard',
      'topDoctorsGrouped',
      'periodAllDoctorsAppointments',
      dateRange?.from,
      dateRange?.to,
      detailPage,
    ],
    queryFn: () =>
      getAppointments({
        fromDate: dateRange!.from,
        toDate: dateRange!.to,
        excludeCancelled: true,
        page: detailPage,
        limit: DETAIL_PAGE_SIZE,
      }),
    enabled: detailOpen && dateRange != null && selectedPeriod != null,
  });

  const rows = appointmentsRes?.data.items ?? [];
  const total = appointmentsRes?.data.total ?? 0;

  const detailColumns = useMemo<ColumnsType<AppointmentListItem>>(
    () => [
      { title: 'Mã lịch hẹn', dataIndex: 'appointmentId', key: 'appointmentId', width: 100 },
      { title: 'Bệnh nhân', dataIndex: 'patientName', key: 'patientName', ellipsis: true },
      { title: 'Bác sĩ', dataIndex: 'doctorName', key: 'doctorName', ellipsis: true },
      { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName', ellipsis: true },
      {
        title: 'Ngày khám',
        dataIndex: 'appointmentDate',
        key: 'appointmentDate',
        width: 110,
        render: (d: string) => (d ? dayjs(d).format(DATE_FORMAT.DATE) : '—'),
      },
      { title: 'Giờ', dataIndex: 'appointmentTime', key: 'appointmentTime', width: 90 },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (s: string) => APPOINTMENT_STATUS_VI[s] ?? s,
      },
    ],
    [],
  );

  const { chartData, periods } = useMemo(() => {
    if (items.length === 0) {
      return {
        chartData: { labels: [] as string[], datasets: [] } as ChartData<'bar'>,
        periods: [] as string[],
      };
    }

    const periodSet = new Set<string>();
    const doctorIdToName = new Map<number, string>();
    const cell = new Map<string, Map<number, number>>();

    for (const row of items) {
      periodSet.add(row.period);
      if (!doctorIdToName.has(row.doctorId)) {
        doctorIdToName.set(row.doctorId, row.doctorName);
      }
      if (!cell.has(row.period)) {
        cell.set(row.period, new Map());
      }
      const m = cell.get(row.period)!;
      m.set(row.doctorId, (m.get(row.doctorId) ?? 0) + row.appointmentCount);
    }

    const sortedPeriods = [...periodSet].sort();
    const doctors = [...doctorIdToName.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'vi', { sensitivity: 'base' }),
    );

    const labels = sortedPeriods.map((p) => formatPeriodLabel(p, groupBy));

    const datasets: ChartDataset<'bar', number[]>[] = doctors.map(([doctorId, doctorName], idx) => ({
      type: 'bar',
      label: doctorName,
      data: sortedPeriods.map((p) => cell.get(p)?.get(doctorId) ?? 0),
      backgroundColor: DOCTOR_BAR_COLORS[idx % DOCTOR_BAR_COLORS.length],
      borderColor: DOCTOR_BAR_COLORS[idx % DOCTOR_BAR_COLORS.length].replace('0.75', '1'),
      borderWidth: 1,
      borderRadius: 2,
      stack: 'doctors',
    }));

    return {
      chartData: { labels, datasets } as ChartData<'bar'>,
      periods: sortedPeriods,
    };
  }, [items, groupBy]);

  const chartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      datasets: {
        bar: {
          maxBarThickness: 56,
        },
      },
      onClick: (_evt, elements, chart) => {
        if (!elements.length || !chart) return;
        const index = elements[0].index;
        const period = periods[index];
        if (!period) return;
        const chartTotalAppointments = chart.data.datasets.reduce((sum, ds) => {
          const arr = ds.data as number[];
          return sum + (Number(arr[index]) || 0);
        }, 0);
        if (chartTotalAppointments <= 0) return;
        setSelectedPeriod({ period, chartTotalAppointments });
        setDetailPage(1);
        setDetailOpen(true);
      },
      onHover: (_event, elements, chart) => {
        const canvas = chart?.canvas;
        if (canvas) {
          canvas.style.cursor = elements.length ? 'pointer' : 'default';
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (ctx) => {
              const i = ctx[0]?.dataIndex;
              if (i === undefined) return '';
              return periods[i] ?? '';
            },
            footer: (ctx) => {
              const sum = ctx.reduce((acc, c) => acc + (Number(c.parsed.y) || 0), 0);
              return `Tổng: ${sum} lịch`;
            },
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v == null || v === 0) return '';
              return `${ctx.dataset.label ?? ''}: ${v} lịch`;
            },
          },
          filter: (item) => (item.parsed.y != null ? Number(item.parsed.y) !== 0 : false),
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    }),
    [periods],
  );

  const hasData = (chartData.labels?.length ?? 0) > 0 && (chartData.datasets?.length ?? 0) > 0;

  return (
    <Card title="Bác sĩ hoạt động nhiều nhất theo chu kỳ (số lịch)">
      <Flex vertical gap={16}>
        <Spin spinning={isFetching}>
          {isError && (
            <Typography.Text type="danger">
              {(error as Error)?.message ?? 'Không tải được dữ liệu thống kê.'}
            </Typography.Text>
          )}
          {!isError && !hasData && !isFetching && <Empty description="Không có dữ liệu trong khoảng đã chọn" />}
          {!isError && hasData && (
            <div className="h-[400px] w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </Spin>
      </Flex>

      <Modal
        title={
          selectedPeriod
            ? `Tất cả bác sĩ — ${formatPeriodLabel(selectedPeriod.period, groupBy)} (${selectedPeriod.chartTotalAppointments} lịch trên biểu đồ)`
            : 'Chi tiết lịch khám'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedPeriod(null);
        }}
        footer={null}
        width={960}
        destroyOnHidden
      >
        {detailError && (
          <Typography.Text type="danger">
            {(detailErr as Error)?.message ?? 'Không tải được danh sách lịch hẹn.'}
          </Typography.Text>
        )}
        {!detailError && dateRange && selectedPeriod && (
          <Flex vertical gap={12} className="mb-3!">
            <Typography.Paragraph type="secondary" className="mb-0!">
              Ngày khám từ {dayjs(dateRange.from).format(DATE_FORMAT.DATE)} đến{' '}
              {dayjs(dateRange.to).format(DATE_FORMAT.DATE)}. Danh sách gồm mọi bác sĩ, không gồm lịch đã hủy (khớp
              thống kê).
            </Typography.Paragraph>
          </Flex>
        )}
        <Table<AppointmentListItem>
          rowKey="appointmentId"
          size="small"
          loading={detailLoading}
          columns={detailColumns}
          dataSource={rows}
          pagination={
            {
              current: detailPage,
              pageSize: DETAIL_PAGE_SIZE,
              total,
              showSizeChanger: false,
              onChange: (p: number) => setDetailPage(p),
            } satisfies TablePaginationConfig
          }
          locale={{ emptyText: 'Không có lịch khám trong ô này.' }}
        />
      </Modal>
    </Card>
  );
}
