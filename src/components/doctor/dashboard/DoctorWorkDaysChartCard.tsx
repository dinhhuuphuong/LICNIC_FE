import { Card, Empty, Spin, Typography } from 'antd';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';

type DoctorWorkDaysChartCardProps = {
  isFetching: boolean;
  isError: boolean;
  errorMessage?: string;
  itemsLength: number;
  chartData: ChartData<'bar', number[], string>;
  chartOptions: ChartOptions<'bar'>;
};

export function DoctorWorkDaysChartCard({
  isFetching,
  isError,
  errorMessage,
  itemsLength,
  chartData,
  chartOptions,
}: DoctorWorkDaysChartCardProps) {
  return (
    <Card title="Biểu đồ số ngày làm theo chu kỳ">
      <Spin spinning={isFetching}>
        {isError ? (
          <Typography.Text type="danger">{errorMessage ?? 'Không tải được dữ liệu thống kê.'}</Typography.Text>
        ) : itemsLength === 0 && !isFetching ? (
          <Empty description="Không có dữ liệu trong khoảng đã chọn" />
        ) : (
          <div className="h-[260px] w-full sm:h-[320px] lg:h-[360px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </Spin>
    </Card>
  );
}
