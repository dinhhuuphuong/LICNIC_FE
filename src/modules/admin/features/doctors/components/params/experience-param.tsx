import { Flex } from 'antd';

import InputParam from '@/components/common/inputs/input-param';

import { DOCTOR_SEARCH_PARAMS } from '../../constants';

const ExperienceParam = () => {
  return (
    <Flex gap={8} wrap>
      <InputParam
        allowClear
        param={DOCTOR_SEARCH_PARAMS.minExperienceYears}
        placeholder="KN từ"
        type="number"
        className="w-[100px]!"
        min={0}
      />
      <InputParam
        allowClear
        param={DOCTOR_SEARCH_PARAMS.maxExperienceYears}
        placeholder="KN đến"
        type="number"
        className="w-[100px]!"
        min={0}
      />
    </Flex>
  );
};

export default ExperienceParam;
