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
import { getReceptionistPayments, type PaymentEntity } from '@/services/paymentService';
import type { AppointmentGroupBy } from '@/services/statisticsService';

import useDashboardParams from '../hooks/common/use-dashboard-params';
import { useGetRevenueByDoctorGroupedQuery } from '../hooks/queries/useGetRevenueByDoctorGroupedQuery';
import { revenuePeriodToPaidDateRange } from '../utils/revenue-period-to-paid-date-range';

dayjs.extend(customParseFormat);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type DoctorBarDataset = ChartDataset<'bar', number[]> & { doctorId: number };

const DOCTOR_BAR_COLORS = [
  'rgba(22, 163, 74, 0.75)',
  'rgba(59, 130, 246, 0.75)',
  'rgba(234, 179, 8, 0.75)',
  'rgba(168, 85, 247, 0.75)',
  'rgba(236, 72, 153, 0.75)',
  'rgba(14, 165, 233, 0.75)',
  'rgba(249, 115, 22, 0.75)',
  'rgba(100, 116, 139, 0.75)',
];

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

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

const PAYMENT_METHOD_VI: Record<string, string> = {
  cash: 'Tiền mặt',
  bank: 'Chuyển khoản',
  online: 'Trực tuyến',
};

const DETAIL_PAGE_SIZE = 10;

type SelectedDoctorSegment = {
  period: string;
  doctorId: number;
  doctorName: string;
  segmentRevenue: number;
};

export default function RevenueByDoctorGroupedChart() {
  const params = useDashboardParams();
  const groupBy = params.groupBy;

  const { data, isFetching, isError, error } = useGetRevenueByDoctorGroupedQuery(params);

  const items = useMemo(() => data?.data.items ?? [], [data]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<SelectedDoctorSegment | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const paidRange = useMemo(
    () => (selectedSegment ? revenuePeriodToPaidDateRange(selectedSegment.period, groupBy) : null),
    [selectedSegment, groupBy],
  );

  const {
    data: paymentsRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: [
      'adminDashboard',
      'revenueByDoctorGrouped',
      'segmentPayments',
      paidRange?.from,
      paidRange?.to,
      selectedSegment?.doctorId,
      detailPage,
    ],
    queryFn: () =>
      getReceptionistPayments({
        paymentStatus: 'paid',
        paidDateFrom: paidRange!.from,
        paidDateTo: paidRange!.to,
        doctorId: selectedSegment!.doctorId,
        page: detailPage,
        limit: DETAIL_PAGE_SIZE,
      }),
    enabled: detailOpen && paidRange != null && selectedSegment != null,
  });

  const paymentRows = paymentsRes?.data.items ?? [];
  const paymentTotal = paymentsRes?.data.total ?? 0;

  const detailColumns = useMemo<ColumnsType<PaymentEntity>>(
    () => [
      {
        title: 'Số hóa đơn',
        dataIndex: 'invoiceNumber',
        key: 'invoiceNumber',
        render: (v: string | null) => v || '—',
      },
      {
        title: 'Mã thanh toán',
        dataIndex: 'paymentId',
        key: 'paymentId',
        width: 110,
      },
      {
        title: 'Số tiền',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        render: (v: number | undefined) => (v != null ? formatVnd(v) : '—'),
      },
      {
        title: 'Ngày thanh toán',
        key: 'paidAt',
        render: (_: unknown, row) => {
          const raw = row.paidAt ?? row.createdAt;
          return raw ? dayjs(raw).format(DATE_FORMAT.DATE_TIME) : '—';
        },
      },
      {
        title: 'Phương thức',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        render: (m: string) => PAYMENT_METHOD_VI[m] ?? m,
      },
      {
        title: 'Lịch hẹn',
        dataIndex: 'appointmentId',
        key: 'appointmentId',
        width: 100,
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
      m.set(row.doctorId, (m.get(row.doctorId) ?? 0) + row.revenue);
    }

    const sortedPeriods = [...periodSet].sort();
    const doctors = [...doctorIdToName.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'vi', { sensitivity: 'base' }),
    );

    const labels = sortedPeriods.map((p) => formatPeriodLabel(p, groupBy));

    const datasets: DoctorBarDataset[] = doctors.map(([doctorId, doctorName], idx) => ({
      type: 'bar',
      label: doctorName,
      doctorId,
      data: sortedPeriods.map((p) => cell.get(p)?.get(doctorId) ?? 0),
      backgroundColor: DOCTOR_BAR_COLORS[idx % DOCTOR_BAR_COLORS.length],
      borderColor: DOCTOR_BAR_COLORS[idx % DOCTOR_BAR_COLORS.length].replace('0.75', '1'),
      borderWidth: 1,
      borderRadius: 2,
      stack: 'revenue',
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
        const { datasetIndex, index } = elements[0];
        const ds = chart.data.datasets[datasetIndex] as DoctorBarDataset | undefined;
        if (ds?.doctorId == null) return;
        const period = periods[index];
        if (!period) return;
        const val = Number(ds.data[index]) || 0;
        if (val <= 0) return;
        setSelectedSegment({
          period,
          doctorId: ds.doctorId,
          doctorName: String(ds.label ?? ''),
          segmentRevenue: val,
        });
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
              return `Tổng: ${formatVnd(sum)}`;
            },
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v == null || v === 0) return '';
              return `${ctx.dataset.label ?? ''}: ${formatVnd(v)}`;
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
            callback: (tickValue) => formatVnd(Number(tickValue)),
          },
        },
      },
    }),
    [periods],
  );

  const hasData = (chartData.labels?.length ?? 0) > 0 && (chartData.datasets?.length ?? 0) > 0;

  return (
    <Card title="Doanh thu theo bác sĩ và chu kỳ">
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
          selectedSegment
            ? `${selectedSegment.doctorName} — ${formatPeriodLabel(selectedSegment.period, groupBy)} (${formatVnd(selectedSegment.segmentRevenue)} trên biểu đồ)`
            : 'Chi tiết thanh toán'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedSegment(null);
        }}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {detailError && (
          <Typography.Text type="danger">
            {(detailErr as Error)?.message ?? 'Không tải được danh sách thanh toán.'}
          </Typography.Text>
        )}
        {!detailError && paidRange && selectedSegment && (
          <Typography.Paragraph type="secondary" className="mb-3!">
            Bác sĩ ID {selectedSegment.doctorId}. Ngày hiệu lực thanh toán từ{' '}
            {dayjs(paidRange.from).format(DATE_FORMAT.DATE)} đến {dayjs(paidRange.to).format(DATE_FORMAT.DATE)} (đã
            thanh toán), khớp cách gom nhóm trên biểu đồ.
          </Typography.Paragraph>
        )}
        <Table<PaymentEntity>
          rowKey="paymentId"
          size="small"
          loading={detailLoading}
          columns={detailColumns}
          dataSource={paymentRows}
          pagination={
            {
              current: detailPage,
              pageSize: DETAIL_PAGE_SIZE,
              total: paymentTotal,
              showSizeChanger: false,
              onChange: (p: number) => setDetailPage(p),
            } satisfies TablePaginationConfig
          }
          locale={{ emptyText: 'Không có thanh toán trong ô này.' }}
        />
      </Modal>
    </Card>
  );
}
