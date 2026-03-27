import { Select } from 'antd';

import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import { SEARCH_PARAMS } from '@/constants/search-params';

const STATUS_OPTIONS = [
  { value: undefined, label: 'Tất cả' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Ngừng' },
];

const ServiceStatusParam = () => {
  return (
    <SelectParamWrapper param={SEARCH_PARAMS.STATUS}>
      <Select allowClear placeholder="Trạng thái" options={STATUS_OPTIONS} style={{ minWidth: 120 }} />
    </SelectParamWrapper>
  );
};

export default ServiceStatusParam;
