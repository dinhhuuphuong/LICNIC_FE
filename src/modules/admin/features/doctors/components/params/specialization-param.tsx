import InputParam from '@/components/common/inputs/input-param';

import { DOCTOR_SEARCH_PARAMS } from '../../constants';

const SpecializationParam = () => {
  return <InputParam param={DOCTOR_SEARCH_PARAMS.specialization} placeholder="Chuyên khoa" className="w-[200px]!" />;
};

export default SpecializationParam;
