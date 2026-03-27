import SelectParam from '@/components/common/selects/select-param';

import { DOCTOR_SEARCH_PARAMS } from '../../constants';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const UserStatusParam = () => {
  return (
    <SelectParam
      allowClear
      className="min-w-[150px]"
      placeholder="Trạng thái"
      param={DOCTOR_SEARCH_PARAMS.userStatus}
      options={STATUS_OPTIONS}
    />
  );
};

export default UserStatusParam;
