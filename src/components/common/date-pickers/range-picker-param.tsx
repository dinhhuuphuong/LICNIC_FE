import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useMemo } from 'react';
import { UrlUpdateType, useQueryParam } from 'use-query-params';

interface RangePickerParamProps extends RangePickerProps {
  /** Tên param cho ngày bắt đầu trong url */
  startParam?: string;
  /** Tên param cho ngày kết thúc trong url */
  endParam?: string;
  updateType?: UrlUpdateType;
  /** Format của date hiển thị */
  format?: string;
  /** Format của date trên param và truyền vào API */
  dbFormat?: string;
}

const RangePickerParam = (props: RangePickerParamProps) => {
  const {
    startParam = SEARCH_PARAMS.FROM_DATE,
    endParam = SEARCH_PARAMS.TO_DATE,
    updateType,
    format = DATE_FORMAT.DATE,
    dbFormat = DATE_FORMAT.DB_DATE,
    defaultValue: defaultValueProp,
    ...rest
  } = props;

  const [startValue, setStartValue] = useQueryParam<string | undefined>(startParam);
  const [endValue, setEndValue] = useQueryParam<string | undefined>(endParam);

  const defaultValue = useMemo(() => {
    if (defaultValueProp) return defaultValueProp;

    const start = startValue ? dayjs(startValue, dbFormat) : undefined;
    const end = endValue ? dayjs(endValue, dbFormat) : undefined;

    if (start || end) {
      return [start, end] as [Dayjs, Dayjs];
    }

    return undefined;
  }, [startValue, endValue, dbFormat, defaultValueProp]);

  const handleChange = useCallback(
    (dates: unknown) => {
      if (dates && Array.isArray(dates) && dates.length === 2) {
        const [start, end] = dates as [Dayjs, Dayjs];
        setStartValue(start?.format(dbFormat) || undefined, updateType);
        setEndValue(end?.format(dbFormat) || undefined, updateType);
      } else {
        setStartValue(undefined, updateType);
        setEndValue(undefined, updateType);
      }
    },
    [setStartValue, setEndValue, dbFormat, updateType],
  );

  return <DatePicker.RangePicker defaultValue={defaultValue} format={format} onChange={handleChange} {...rest} />;
};

export default RangePickerParam;
