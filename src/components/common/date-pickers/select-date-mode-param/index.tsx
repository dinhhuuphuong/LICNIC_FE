import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import type { Dayjs } from 'dayjs';
import { useQueryParam } from 'use-query-params';
import RangePickerParam from '../range-picker-param';
import DatePickerParam from './date-picker-param';
import SelectModeParam from './select-mode-param';

interface SelectDateModeParamProps {
  defaultValue?: Dayjs;
}

const SelectDateModeParam = (props: SelectDateModeParamProps) => {
  const { defaultValue } = props;

  const [dateMode] = useQueryParam<string>(SEARCH_PARAMS.DATE_MODE);

  return (
    <>
      <SelectModeParam />
      {(dateMode === 'custom' && (
        <RangePickerParam dbFormat={DATE_FORMAT.DB_DATE} defaultValue={[defaultValue, defaultValue]} />
      )) || <DatePickerParam defaultValue={defaultValue} />}
    </>
  );
};

export default SelectDateModeParam;
