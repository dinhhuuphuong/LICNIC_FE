import { Flex, Typography } from 'antd';

import InputSearchParam from '@/components/common/inputs/keyword-param';
import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import { SEARCH_PARAMS } from '@/constants/search-params';
import ModifyUser from '../components/ModifyUser';
import StatusParam from '../components/params/status-param';
import SelectRole from '../components/selects/select-role';
import UsersTable from '../components/UsersTable';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý người dùng
        </Typography.Title>

        <Flex gap={8} wrap>
          <SelectParamWrapper isNumber param={SEARCH_PARAMS.ROLE}>
            <SelectRole placeholder="Vai trò" />
          </SelectParamWrapper>
          <StatusParam />
          <InputSearchParam placeholder="Tìm kiếm" className="w-[200px]!" />
          <ModifyUser />
        </Flex>
      </Flex>
      <UsersTable />
    </Flex>
  );
};

export default Manage;
