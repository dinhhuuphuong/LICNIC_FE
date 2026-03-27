import { Flex, Typography } from 'antd';

import InputSearchParam from '@/components/common/inputs/keyword-param';
import ModifyServiceCategory from '../components/ModifyServiceCategory';
import ServiceCategoriesTable from '../components/ServiceCategoriesTable';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý danh mục dịch vụ
        </Typography.Title>

        <Flex gap={8} wrap>
          <InputSearchParam placeholder="Tìm kiếm" className="w-[200px]!" />
          <ModifyServiceCategory />
        </Flex>
      </Flex>
      <ServiceCategoriesTable />
    </Flex>
  );
};

export default Manage;
