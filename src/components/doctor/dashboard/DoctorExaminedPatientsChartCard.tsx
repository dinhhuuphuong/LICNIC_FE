import { useQuery } from '@tanstack/react-query';
import { Card, Empty, Modal, Spin, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { ChartData, ChartOptions } from 'chart.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

import DATE_FORMAT from '@/constants/date-format';
import { getAppointments, type AppointmentListItem } from '@/services/appointmentService';
import type { ExaminedPatientsGroupedItem } from '@/services/statisticsService';

import {
  doctorWorkGroupedPeriodToDateRange,
  type DoctorWorkDaysGroupBy,
} from './doctor-work-grouped-period-to-date-range';

dayjs.extend(customParseFormat);

const DETAIL_PAGE_SIZE = 10;

const APPOINTMENT_STATUS_VI: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  checked_in: 'Đã check-in',
};

type DoctorExaminedPatientsChartCardProps = {
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  itemsLength: number;
  chartData: ChartData<'bar', number[], string>;
  chartOptions: ChartOptions<'bar'>;
  examinedPatientsItems: ExaminedPatientsGroupedItem[];
  groupBy: DoctorWorkDaysGroupBy;
  doctorId?: number;
  formatPeriodLabel: (period: string, groupBy: DoctorWorkDaysGroupBy) => string;
};

export function DoctorExaminedPatientsChartCard({
  isFetching,
  isError,
  errorMessage,
  itemsLength,
  chartData,
  chartOptions,
  examinedPatientsItems,
  groupBy,
  doctorId,
  formatPeriodLabel,
}: DoctorExaminedPatientsChartCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const selectedRow = selectedIndex != null ? examinedPatientsItems[selectedIndex] : null;

  const dateRange = useMemo(
    () => (selectedRow ? doctorWorkGroupedPeriodToDateRange(selectedRow.period, groupBy) : null),
    [selectedRow, groupBy],
  );

  const {
    data: appointmentsRes,
    isFetching: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useQuery({
    queryKey: ['doctor-dashboard', 'examined-patients-detail', doctorId, dateRange?.from, dateRange?.to, detailPage],
    queryFn: () =>
      getAppointments({
        doctorId,
        fromDate: dateRange!.from,
        toDate: dateRange!.to,
        statusIn: ['completed'],
        page: detailPage,
        limit: DETAIL_PAGE_SIZE,
      }),
    enabled: detailOpen && doctorId != null && dateRange != null,
  });

  const rows = appointmentsRes?.data.items ?? [];
  const total = appointmentsRes?.data.total ?? 0;

  const detailColumns = useMemo<ColumnsType<AppointmentListItem>>(
    () => [
      { title: 'Mã lịch hẹn', dataIndex: 'appointmentId', key: 'appointmentId', width: 100 },
      { title: 'Bệnh nhân', dataIndex: 'patientName', key: 'patientName', ellipsis: true },
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

  const mergedChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      ...chartOptions,
      onClick: (_evt, elements, chart) => {
        if (doctorId == null || !elements.length || !chart) return;
        const index = elements[0].index;
        const row = examinedPatientsItems[index];
        if (!row || row.patientCount <= 0) return;
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
    [chartOptions, doctorId, examinedPatientsItems],
  );

  return (
    <Card title="Biểu đồ số bệnh nhân đã khám theo chu kỳ">
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
            ? `Bệnh nhân đã khám — ${formatPeriodLabel(selectedRow.period, groupBy)} (${selectedRow.patientCount} BN trên biểu đồ)`
            : 'Chi tiết lịch khám'
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedIndex(null);
        }}
        footer={null}
        width={900}
        destroyOnHidden
      >
        {doctorId == null && (
          <Typography.Text type="warning">Chưa xác định bác sĩ — không tải được danh sách.</Typography.Text>
        )}
        {detailError && (
          <Typography.Text type="danger">{(detailErr as Error)?.message ?? 'Không tải được lịch hẹn.'}</Typography.Text>
        )}
        {!detailError && dateRange && selectedRow && doctorId != null && (
          <Typography.Paragraph type="secondary" className="mb-3!">
            Ngày khám từ {dayjs(dateRange.from).format(DATE_FORMAT.DATE)} đến{' '}
            {dayjs(dateRange.to).format(DATE_FORMAT.DATE)}. Trạng thái: đã hoàn thành hoặc đã check-in.
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
          locale={{ emptyText: 'Không có lịch trong kỳ này.' }}
        />
      </Modal>
    </Card>
  );
}
