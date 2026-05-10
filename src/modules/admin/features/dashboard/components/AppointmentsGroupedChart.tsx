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
import { getAppointments, type AppointmentListItem } from '@/services/appointmentService';
import type { AppointmentGroupBy, AppointmentGroupedItem } from '@/services/statisticsService';

import useDashboardParams from '../hooks/common/use-dashboard-params';
import { useGetAppointmentsGroupedQuery } from '../hooks/queries/useGetAppointmentsGroupedQuery';
import { revenuePeriodToPaidDateRange } from '../utils/revenue-period-to-paid-date-range';

dayjs.extend(customParseFormat);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

export default function AppointmentsGroupedChart() {
  const params = useDashboardParams();
  const groupBy = params.groupBy;

  const { data, isFetching, isError, error } = useGetAppointmentsGroupedQuery(params);

  const items = useMemo(() => data?.data.items ?? [], [data]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBar, setSelectedBar] = useState<AppointmentGroupedItem | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const dateRange = useMemo(
    () => (selectedBar ? revenuePeriodToPaidDateRange(selectedBar.period, groupBy) : null),
    [selectedBar, groupBy],
  );

  const {
    data: appointmentsRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: [
      'adminDashboard',
      'appointmentsGrouped',
      'periodAppointments',
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
    enabled: detailOpen && dateRange != null,
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

  const chartData = useMemo(() => {
    const labels = items.map((row) => formatPeriodLabel(row.period, groupBy));
    const counts = items.map((row) => row.appointmentCount);

    return {
      labels,
      datasets: [
        {
          label: 'Số lịch khám',
          data: counts,
          backgroundColor: 'rgba(22, 119, 255, 0.65)',
          borderColor: 'rgba(22, 119, 255, 1)',
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
              return `${ctx.dataset.label ?? ''}: ${v}`;
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
            precision: 0,
          },
        },
      },
    }),
    [items],
  );

  return (
    <Card title="Thống kê số lịch khám theo chu kỳ">
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
            ? `Lịch khám trong kỳ: ${formatPeriodLabel(selectedBar.period, groupBy)} (${selectedBar.appointmentCount} lịch trên biểu đồ)`
            : 'Chi tiết lịch khám'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedBar(null);
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
        {!detailError && dateRange && (
          <Typography.Paragraph type="secondary" className="mb-3!">
            Ngày khám từ {dayjs(dateRange.from).format(DATE_FORMAT.DATE)} đến{' '}
            {dayjs(dateRange.to).format(DATE_FORMAT.DATE)}, không gồm lịch đã hủy (giống thống kê).
          </Typography.Paragraph>
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
          locale={{ emptyText: 'Không có lịch khám trong kỳ này.' }}
        />
      </Modal>
    </Card>
  );
}
