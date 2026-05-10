import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Modal, Spin, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { ChartData, ChartOptions } from 'chart.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import DATE_FORMAT from '@/constants/date-format';
import { getDoctorWorkSchedulesFromStore, type DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import type { DoctorWorkDaysGroupedItem } from '@/services/statisticsService';

import {
  doctorWorkGroupedPeriodToDateRange,
  type DoctorWorkDaysGroupBy,
} from './doctor-work-grouped-period-to-date-range';

dayjs.extend(customParseFormat);

const DETAIL_PAGE_SIZE = 10;

const SCHEDULE_STATUS_VI: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

type DoctorWorkDaysChartCardProps = {
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  itemsLength: number;
  chartData: ChartData<'bar', number[], string>;
  chartOptions: ChartOptions<'bar'>;
  workDaysItems: DoctorWorkDaysGroupedItem[];
  groupBy: DoctorWorkDaysGroupBy;
  /** Lấy từ thống kê / hồ sơ bác sĩ — cần để tải ca làm việc */
  doctorId?: number;
  formatPeriodLabel: (period: string, groupBy: DoctorWorkDaysGroupBy) => string;
};

export function DoctorWorkDaysChartCard({
  isFetching,
  isError,
  errorMessage,
  itemsLength,
  chartData,
  chartOptions,
  workDaysItems,
  groupBy,
  doctorId,
  formatPeriodLabel,
}: DoctorWorkDaysChartCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const selectedRow = selectedIndex != null ? workDaysItems[selectedIndex] : null;

  const dateRange = useMemo(
    () => (selectedRow ? doctorWorkGroupedPeriodToDateRange(selectedRow.period, groupBy) : null),
    [selectedRow, groupBy],
  );

  const {
    data: schedulesRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: ['doctor-dashboard', 'work-days-detail', doctorId, dateRange?.from, dateRange?.to, detailPage],
    queryFn: () =>
      getDoctorWorkSchedulesFromStore({
        doctorId,
        fromDate: dateRange!.from,
        toDate: dateRange!.to,
        page: detailPage,
        limit: DETAIL_PAGE_SIZE,
        status: 'approved',
      }),
    enabled: detailOpen && doctorId != null && dateRange != null,
  });

  const scheduleRows = schedulesRes?.data.items ?? [];
  const scheduleTotal = schedulesRes?.data.total ?? 0;

  const detailColumns = useMemo<ColumnsType<DoctorWorkSchedule>>(
    () => [
      { title: 'Mã ca', dataIndex: 'scheduleId', key: 'scheduleId', width: 88 },
      {
        title: 'Ngày làm',
        dataIndex: 'workDate',
        key: 'workDate',
        width: 118,
        render: (d: string) => (d ? dayjs(d).format(DATE_FORMAT.DATE) : '—'),
      },
      { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime', width: 96 },
      { title: 'Kết thúc', dataIndex: 'endTime', key: 'endTime', width: 96 },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (s: string) => SCHEDULE_STATUS_VI[s] ?? s,
      },
    ],
    [],
  );

  const mergedChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      ...chartOptions,
      onClick: (_evt, elements, chart) => {
        if (doctorId == null || !elements.length || !chart) return;
        const index = elements[0].index;
        const row = workDaysItems[index];
        if (!row || row.workDays <= 0) return;
        setSelectedIndex(index);
        setDetailPage(1);
        setDetailOpen(true);
      },
      onHover: (_event, elements, chart) => {
        const canvas = chart?.canvas;
        if (canvas) {
          canvas.style.cursor = doctorId != null && elements.length ? 'pointer' : 'default';
        }
      },
    }),
    [chartOptions, doctorId, workDaysItems],
  );

  return (
    <Card title="Biểu đồ số ngày làm theo chu kỳ">
      <Spin spinning={isFetching}>
        {isError ? (
          <Typography.Text type="danger">{errorMessage ?? 'Không tải được dữ liệu thống kê.'}</Typography.Text>
        ) : itemsLength === 0 && !isFetching ? (
          <Empty description="Không có dữ liệu trong khoảng đã chọn" />
        ) : (
          <div className="h-[260px] w-full sm:h-[320px] lg:h-[360px]">
            <Bar data={chartData} options={mergedChartOptions} />
          </div>
        )}
      </Spin>

      <Modal
        title={
          selectedRow
            ? `Ca làm việc — ${formatPeriodLabel(selectedRow.period, groupBy)} (${selectedRow.workDays} ngày làm trên biểu đồ)`
            : 'Chi tiết ca làm việc'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedIndex(null);
        }}
        footer={null}
        width={720}
        destroyOnHidden
      >
        {doctorId == null && (
          <Typography.Text type="warning">Chưa xác định bác sĩ — không tải được danh sách ca.</Typography.Text>
        )}
        {detailError && (
          <Typography.Text type="danger">{(detailErr as Error)?.message ?? 'Không tải được lịch ca.'}</Typography.Text>
        )}
        {!detailError && dateRange && selectedRow && doctorId != null && (
          <Typography.Paragraph type="secondary" className="mb-3!">
            Ngày làm từ {dayjs(dateRange.from).format(DATE_FORMAT.DATE)} đến{' '}
            {dayjs(dateRange.to).format(DATE_FORMAT.DATE)}.
          </Typography.Paragraph>
        )}
        <Table<DoctorWorkSchedule>
          rowKey="scheduleId"
          size="small"
          loading={detailLoading}
          columns={detailColumns}
          dataSource={scheduleRows}
          pagination={
            {
              current: detailPage,
              pageSize: DETAIL_PAGE_SIZE,
              total: scheduleTotal,
              showSizeChanger: false,
              onChange: (p: number) => setDetailPage(p),
            } satisfies TablePaginationConfig
          }
          locale={{ emptyText: 'Không có ca trong kỳ này.' }}
        />
      </Modal>
    </Card>
  );
}
