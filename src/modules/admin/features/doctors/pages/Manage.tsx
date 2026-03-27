import { Flex, Typography } from 'antd';

import InputSearchParam from '@/components/common/inputs/keyword-param';

import DoctorsTable from '../components/DoctorsTable';
import ModifyDoctor from '../components/ModifyDoctor';
import ConsultationFeeParam from '../components/params/consultation-fee-param';
import ExperienceParam from '../components/params/experience-param';
import SpecializationParam from '../components/params/specialization-param';
import UserStatusParam from '../components/params/user-status-param';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý bác sĩ
        </Typography.Title>

        <Flex gap={8} wrap>
          <SpecializationParam />
          <ExperienceParam />
          <ConsultationFeeParam />
          <UserStatusParam />
          <InputSearchParam placeholder="Tìm kiếm" className="w-[200px]!" />
          <ModifyDoctor />
        </Flex>
      </Flex>
      <DoctorsTable />
    </Flex>
  );
};

export default Manage;
