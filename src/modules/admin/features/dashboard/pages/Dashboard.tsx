import { Col, Flex, Row, Typography } from 'antd';
import dayjs from 'dayjs';

import RangePickerParam from '@/components/common/date-pickers/range-picker-param';
import SelectModeParam from '@/components/common/date-pickers/select-date-mode-param/select-mode-param';
import DATE_FORMAT from '@/constants/date-format';
import AppointmentsGroupedChart from '../components/AppointmentsGroupedChart';
import RevenueByDoctorGroupedChart from '../components/RevenueByDoctorGroupedChart';
import RevenueGroupedChart from '../components/RevenueGroupedChart';
import TopDoctorsGroupedChart from '../components/TopDoctorsGroupedChart';
import TopServicesByDoctorGroupedChart from '../components/TopServicesByDoctorGroupedChart';
import TopServicesGroupedChart from '../components/TopServicesGroupedChart';

const Dashboard = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Dashboard
        </Typography.Title>

        <Flex gap={8} wrap>
          <SelectModeParam />
          <RangePickerParam
            dbFormat={DATE_FORMAT.DB_DATE}
            defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
          />
        </Flex>
      </Flex>

      <Row gutter={[16, 16]} className="min-h-0">
        <Col xs={24} lg={12} className="min-h-0">
          <RevenueGroupedChart />
        </Col>
        <Col xs={24} lg={12} className="min-h-0">
          <AppointmentsGroupedChart />
        </Col>
        <Col xs={24} lg={12} className="min-h-0">
          <RevenueByDoctorGroupedChart />
        </Col>
        <Col xs={24} lg={12} className="min-h-0">
          <TopServicesGroupedChart />
        </Col>
        <Col xs={24} lg={12} className="min-h-0">
          <TopDoctorsGroupedChart />
        </Col>
        <Col xs={24} lg={12} className="min-h-0">
          <TopServicesByDoctorGroupedChart />
        </Col>
      </Row>
    </Flex>
  );
};

export default Dashboard;
