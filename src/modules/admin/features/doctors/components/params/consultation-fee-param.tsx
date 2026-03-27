import { Flex } from 'antd';

import InputParam from '@/components/common/inputs/input-param';

import { DOCTOR_SEARCH_PARAMS } from '../../constants';

const ConsultationFeeParam = () => {
  return (
    <Flex gap={8} wrap>
      <InputParam
        allowClear
        param={DOCTOR_SEARCH_PARAMS.minConsultationFee}
        placeholder="Phí từ"
        type="number"
        className="w-[120px]!"
        min={0}
        step={1000}
      />
      <InputParam
        allowClear
        param={DOCTOR_SEARCH_PARAMS.maxConsultationFee}
        placeholder="Phí đến"
        type="number"
        className="w-[120px]!"
        min={0}
        step={1000}
      />
    </Flex>
  );
};

export default ConsultationFeeParam;
