import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Flex, Modal, Spin, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
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
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import DATE_FORMAT from '@/constants/date-format';
import { getReceptionistPayments, type PaymentEntity } from '@/services/paymentService';
import type { AppointmentGroupBy, RevenueGroupedItem } from '@/services/statisticsService';

import useDashboardParams from '../hooks/common/use-dashboard-params';
import { useGetRevenueGroupedQuery } from '../hooks/queries/useGetRevenueGroupedQuery';
import { revenuePeriodToPaidDateRange } from '../utils/revenue-period-to-paid-date-range';

dayjs.extend(customParseFormat);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

export default function RevenueGroupedChart() {
  const params = useDashboardParams();
  const groupBy = params.groupBy;

  const { data, isFetching, isError, error } = useGetRevenueGroupedQuery(params);

  const items = useMemo(() => data?.data.items ?? [], [data]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<RevenueGroupedItem | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const paidRange = useMemo(
    () => (selectedBar ? revenuePeriodToPaidDateRange(selectedBar.period, groupBy) : null),
    [selectedBar, groupBy],
  );

  const {
    data: paymentsRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: ['adminDashboard', 'revenueGrouped', 'periodPayments', paidRange?.from, paidRange?.to, detailPage],
    queryFn: () =>
      getReceptionistPayments({
        paymentStatus: 'paid',
        paidDateFrom: paidRange!.from,
        paidDateTo: paidRange!.to,
        page: detailPage,
        limit: DETAIL_PAGE_SIZE,
      }),
    enabled: detailOpen && paidRange != null,
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

  const chartData = useMemo(() => {
    const labels = items.map((row) => formatPeriodLabel(row.period, groupBy));
    const revenues = items.map((row) => row.revenue);

    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu',
          data: revenues,
          backgroundColor: 'rgba(22, 163, 74, 0.65)',
          borderColor: 'rgba(22, 163, 74, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [items, groupBy]);

  const chartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      datasets: {
        bar: {
          maxBarThickness: 50,
        },
      },
      onClick: (_event, elements) => {
        if (!elements.length) return;
        const idx = elements[0].index;
        const row = items[idx];
        if (!row) return;
        setSelectedBar(row);
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
              return items[i]?.period ?? '';
            },
            label: (ctx) => {
              const v = ctx.parsed.y;
              if (v == null) return '';
              return `${ctx.dataset.label ?? ''}: ${formatVnd(v)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (tickValue) => formatVnd(Number(tickValue)),
          },
        },
      },
    }),
    [items],
  );

  return (
    <Card title="Thống kê doanh thu theo chu kỳ">
      <Flex vertical gap={16}>
        <Spin spinning={isFetching}>
          {isError && (
            <Typography.Text type="danger">
              {(error as Error)?.message ?? 'Không tải được dữ liệu thống kê.'}
            </Typography.Text>
          )}
          {!isError && items.length === 0 && !isFetching && (
            <Empty description="Không có dữ liệu trong khoảng đã chọn" />
          )}
          {!isError && items.length > 0 && (
            <div className="h-[360px] w-full">
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </Spin>
      </Flex>

      <Modal
        title={
          selectedBar
            ? `Thanh toán trong kỳ: ${formatPeriodLabel(selectedBar.period, groupBy)} (${formatVnd(selectedBar.revenue)})`
            : 'Chi tiết thanh toán'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedBar(null);
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
        {!detailError && paidRange && (
          <Typography.Paragraph type="secondary" className="mb-3!">
            Lọc theo ngày hiệu lực thanh toán từ {dayjs(paidRange.from).format(DATE_FORMAT.DATE)} đến{' '}
            {dayjs(paidRange.to).format(DATE_FORMAT.DATE)} (đã thanh toán), khớp cách gom nhóm trên biểu đồ.
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
          locale={{ emptyText: 'Không có thanh toán trong kỳ này.' }}
        />
      </Modal>
    </Card>
  );
}
