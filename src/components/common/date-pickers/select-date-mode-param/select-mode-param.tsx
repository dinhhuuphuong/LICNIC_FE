import { SEARCH_PARAMS } from '@/constants/search-params';
import { useQueryParam } from 'use-query-params';
import SelectParam from '../../selects/select-param';

const options = [
  {
    label: 'Ngày',
    value: 'day',
  },
  {
    label: 'Tuần',
    value: 'week',
  },
  {
    label: 'Tháng',
    value: 'month',
  },
  {
    label: 'Năm',
    value: 'year',
  },
];

const SelectModeParam = () => {
  const [dateMode] = useQueryParam<string>(SEARCH_PARAMS.DATE_MODE);

  return (
    <SelectParam
      className="w-[102px]"
      defaultValue={dateMode || 'month'}
      options={options}
      param={SEARCH_PARAMS.DATE_MODE}
    />
  );
};

export default SelectModeParam;
