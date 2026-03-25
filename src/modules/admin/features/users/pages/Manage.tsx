import { Flex, Typography } from 'antd';

import ModifyUser from '../components/ModifyUser';
import UsersTable from '../components/UsersTable';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={4}>Quản lý người dùng</Typography.Title>
        <ModifyUser />
      </Flex>
      <UsersTable />
    </Flex>
  );
};

export default Manage;
