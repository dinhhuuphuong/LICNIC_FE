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
import { useGetRevenueGroupedQuery } from '../hooks/queries/useGetRevenueGroupedQuery';

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

export default function RevenueGroupedChart() {
  const params = useDashboardParams();
  const groupBy = params.groupBy;

  const { data, isFetching, isError, error } = useGetRevenueGroupedQuery(params);

  const items = useMemo(() => data?.data.items ?? [], [data]);

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
    </Card>
  );
}
