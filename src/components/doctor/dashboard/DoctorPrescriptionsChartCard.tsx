import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Modal, Spin, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { ChartData, ChartOptions } from 'chart.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import DATE_FORMAT from '@/constants/date-format';
import { getPrescriptions, type RecordPrescription } from '@/services/prescriptionService';
import type { PrescriptionsGroupedItem } from '@/services/statisticsService';

import {
  doctorWorkGroupedPeriodToDateRange,
  type DoctorWorkDaysGroupBy,
} from './doctor-work-grouped-period-to-date-range';

dayjs.extend(customParseFormat);

const DETAIL_PAGE_SIZE = 10;

type DoctorPrescriptionsChartCardProps = {
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  itemsLength: number;
  chartData: ChartData<'bar', number[], string>;
  chartOptions: ChartOptions<'bar'>;
  prescriptionsItems: PrescriptionsGroupedItem[];
  groupBy: DoctorWorkDaysGroupBy;
  doctorId?: number;
  formatPeriodLabel: (period: string, groupBy: DoctorWorkDaysGroupBy) => string;
};

export function DoctorPrescriptionsChartCard({
  isFetching,
  isError,
  errorMessage,
  itemsLength,
  chartData,
  chartOptions,
  prescriptionsItems,
  groupBy,
  doctorId,
  formatPeriodLabel,
}: DoctorPrescriptionsChartCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const selectedRow = selectedIndex != null ? prescriptionsItems[selectedIndex] : null;

  const dateRange = useMemo(
    () => (selectedRow ? doctorWorkGroupedPeriodToDateRange(selectedRow.period, groupBy) : null),
    [selectedRow, groupBy],
  );

  const {
    data: prescriptionsRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: ['doctor-dashboard', 'prescriptions-detail', doctorId, dateRange?.from, dateRange?.to, detailPage],
    queryFn: () =>
      getPrescriptions({
        doctorId,
        createdFromDate: dateRange!.from,
        createdToDate: dateRange!.to,
        page: detailPage,
        limit: DETAIL_PAGE_SIZE,
      }),
    enabled: detailOpen && doctorId != null && dateRange != null,
  });

  const rows = prescriptionsRes?.data.items ?? [];
  const total = prescriptionsRes?.data.total ?? 0;

  const detailColumns = useMemo<ColumnsType<RecordPrescription>>(
    () => [
      { title: 'Mã dòng', dataIndex: 'prescriptionId', key: 'prescriptionId', width: 88 },
      { title: 'Hồ sơ', dataIndex: 'recordId', key: 'recordId', width: 80 },
      {
        title: 'Thuốc',
        key: 'medicineName',
        ellipsis: true,
        render: (_: unknown, row) => row.medicine?.medicineName ?? '—',
      },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 90, align: 'right' },
      { title: 'Liều dùng', dataIndex: 'dosage', key: 'dosage', ellipsis: true },
      {
        title: 'Ngày kê',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 130,
        render: (v: string) => (v ? dayjs(v).format(DATE_FORMAT.DATE_TIME) : '—'),
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
        const row = prescriptionsItems[index];
        if (!row || row.prescriptionCount <= 0) return;
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
    [chartOptions, doctorId, prescriptionsItems],
  );

  return (
    <Card title="Biểu đồ số dòng thuốc đã kê theo chu kỳ">
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
            ? `Đơn thuốc đã kê — ${formatPeriodLabel(selectedRow.period, groupBy)} (${selectedRow.prescriptionCount} dòng trên biểu đồ)`
            : 'Chi tiết đơn thuốc'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedIndex(null);
        }}
        footer={null}
        width={920}
        destroyOnHidden
      >
        {doctorId == null && (
          <Typography.Text type="warning">Chưa xác định bác sĩ — không tải được danh sách.</Typography.Text>
        )}
        {detailError && (
          <Typography.Text type="danger">
            {(detailErr as Error)?.message ?? 'Không tải được đơn thuốc.'}
          </Typography.Text>
        )}
        {!detailError && dateRange && selectedRow && doctorId != null && (
          <Typography.Paragraph type="secondary" className="mb-3!">
            Ngày tạo đơn (theo hệ thống) từ {dayjs(dateRange.from).format(DATE_FORMAT.DATE)} đến{' '}
            {dayjs(dateRange.to).format(DATE_FORMAT.DATE)}.
          </Typography.Paragraph>
        )}
        <Table<RecordPrescription>
          rowKey="prescriptionId"
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
          locale={{ emptyText: 'Không có dòng thuốc trong kỳ này.' }}
        />
      </Modal>
    </Card>
  );
}
