import { Flex, Typography } from 'antd';

import InputSearchParam from '@/components/common/inputs/keyword-param';
import ModifyService from '../components/ModifyService';
import ServicesTable from '../components/ServicesTable';
import ServiceCategoryParam from '../components/params/category-param';
import ServiceStatusParam from '../components/params/status-param';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý dịch vụ
        </Typography.Title>

        <Flex gap={8} wrap>
          <ServiceCategoryParam />
          <ServiceStatusParam />
          <InputSearchParam placeholder="Tìm kiếm" className="w-[200px]!" />
          <ModifyService />
        </Flex>
      </Flex>
      <ServicesTable />
    </Flex>
  );
};

export default Manage;
