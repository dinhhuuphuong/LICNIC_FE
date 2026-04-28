import { Flex, Typography } from 'antd';

import InputSearchParam from '@/components/common/inputs/keyword-param';
import MedicinesTable from '../components/MedicinesTable';
import ModifyMedicine from '../components/ModifyMedicine';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý thuốc
        </Typography.Title>

        <Flex gap={8} wrap>
          <InputSearchParam placeholder="Tìm kiếm" className="w-[200px]!" />
          <ModifyMedicine />
        </Flex>
      </Flex>
      <MedicinesTable />
    </Flex>
  );
};

export default Manage;
