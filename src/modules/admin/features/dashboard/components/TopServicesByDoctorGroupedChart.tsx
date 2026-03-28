import { Card, Empty, Flex, Spin, Typography } from 'antd';
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
import { Bar } from 'react-chartjs-2';

import DATE_FORMAT from '@/constants/date-format';
import type { AppointmentGroupBy } from '@/services/statisticsService';

import useDashboardParams from '../hooks/common/use-dashboard-params';
import { useGetTopServicesByDoctorGroupedQuery } from '../hooks/queries/useGetTopServicesByDoctorGroupedQuery';

dayjs.extend(customParseFormat);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PAIR_BAR_COLORS = [
  'rgba(22, 119, 255, 0.75)',
  'rgba(22, 163, 74, 0.75)',
  'rgba(234, 179, 8, 0.75)',
  'rgba(168, 85, 247, 0.75)',
  'rgba(236, 72, 153, 0.75)',
  'rgba(14, 165, 233, 0.75)',
  'rgba(249, 115, 22, 0.75)',
  'rgba(100, 116, 139, 0.75)',
];

type DoctorServiceKey = `${number}-${number}`;

function pairKey(doctorId: number, serviceId: number): DoctorServiceKey {
  return `${doctorId}-${serviceId}`;
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

export default function TopServicesByDoctorGroupedChart() {
  const params = useDashboardParams();
  const groupBy = params.groupBy;

  const { data, isFetching, isError, error } = useGetTopServicesByDoctorGroupedQuery(params);

  const items = useMemo(() => data?.data.items ?? [], [data]);

  const { chartData, periods } = useMemo(() => {
    if (items.length === 0) {
      return {
        chartData: { labels: [] as string[], datasets: [] },
        periods: [] as string[],
      };
    }

    const periodSet = new Set<string>();
    const keyToLabel = new Map<DoctorServiceKey, string>();
    const cell = new Map<string, Map<DoctorServiceKey, number>>();

    for (const row of items) {
      periodSet.add(row.period);
      const k = pairKey(row.doctorId, row.serviceId);
      if (!keyToLabel.has(k)) {
        keyToLabel.set(k, `${row.doctorName} — ${row.serviceName}`);
      }
      if (!cell.has(row.period)) {
        cell.set(row.period, new Map());
      }
      const m = cell.get(row.period)!;
      m.set(k, (m.get(k) ?? 0) + row.appointmentCount);
    }

    const sortedPeriods = [...periodSet].sort();
    const pairs = [...keyToLabel.entries()].sort((a, b) => a[1].localeCompare(b[1], 'vi', { sensitivity: 'base' }));

    const labels = sortedPeriods.map((p) => formatPeriodLabel(p, groupBy));

    const datasets = pairs.map(([key, label], idx) => ({
      label,
      data: sortedPeriods.map((p) => cell.get(p)?.get(key) ?? 0),
      backgroundColor: PAIR_BAR_COLORS[idx % PAIR_BAR_COLORS.length],
      borderColor: PAIR_BAR_COLORS[idx % PAIR_BAR_COLORS.length].replace('0.75', '1'),
      borderWidth: 1,
      borderRadius: 2,
      stack: 'doctorService',
    }));

    return { chartData: { labels, datasets }, periods: sortedPeriods };
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

  const hasData = chartData.labels.length > 0 && chartData.datasets.length > 0;

  return (
    <Card title="Dịch vụ hot theo bác sĩ và chu kỳ">
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
    </Card>
  );
}
