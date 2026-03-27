import SelectParam from '@/components/common/selects/select-param';
import { SEARCH_PARAMS } from '@/constants/search-params';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const StatusParam = () => {
  return (
    <SelectParam
      allowClear
      className="min-w-[150px]"
      placeholder="Trạng thái"
      param={SEARCH_PARAMS.STATUS}
      options={STATUS_OPTIONS}
    />
  );
};

export default StatusParam;
