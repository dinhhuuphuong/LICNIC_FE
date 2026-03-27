import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { DatePicker, DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useMemo } from 'react';
import { StringParam, UrlUpdateType, useQueryParam, useQueryParams } from 'use-query-params';

interface DatePickerParamProps extends DatePickerProps {
  /** Tên param trong url */
  param?: string;
  toDateParam?: string;
  updateType?: UrlUpdateType;
  /** Format của date */
  format?: string;
  /** Format của date trên param và truyền vào API */
  dbFormat?: string;

  defaultValue?: Dayjs;
}

const DatePickerParam = (props: DatePickerParamProps) => {
  const {
    param = SEARCH_PARAMS.DATE,
    updateType,
    format = DATE_FORMAT.DATE,
    dbFormat = DATE_FORMAT.DB_DATE,
    defaultValue: defaultValueProp,
    toDateParam,
    ...rest
  } = props;

  const [value, setValue] = useQueryParam<string | undefined>(param);
  const [queryParams, setQueryParams] = useQueryParams({
    [param]: StringParam,
    [toDateParam || SEARCH_PARAMS.TO_DATE]: StringParam,
  });

  const defaultValue = useMemo(
    () => (value ? dayjs(value, dbFormat) : defaultValueProp),
    [value, dbFormat, defaultValueProp],
  );

  const handleChange = useCallback(
    (dateParam: Dayjs | Dayjs[] | null) => {
      const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;

      const toDate = queryParams[toDateParam || SEARCH_PARAMS.TO_DATE] || dayjs().endOf('month').format(dbFormat);
      if (toDateParam) {
        const selectedOrDefault = date || defaultValueProp || null;
        const newFromDateStr = selectedOrDefault ? selectedOrDefault.format(dbFormat) : undefined;

        let newToDateStr: string | undefined = toDate;

        const currentTo = toDate ? dayjs(toDate, dbFormat) : null;
        const newFrom = selectedOrDefault ? dayjs(selectedOrDefault.format(dbFormat), dbFormat) : null;

        if (!currentTo || !newFrom) {
          // If missing either side, align toDate with fromDate for consistency
          newToDateStr = newFromDateStr;
        } else if (currentTo.isBefore(newFrom, 'day')) {
          // Only update toDate when it is earlier than the new from date
          newToDateStr = newFromDateStr;
        }

        setQueryParams(
          {
            [param]: newFromDateStr,
            [toDateParam]: newToDateStr,
          },
          updateType,
        );
      } else setValue(date?.format(dbFormat) || defaultValueProp?.format(dbFormat), updateType);
    },
    [queryParams, toDateParam, dbFormat, setValue, defaultValueProp, updateType, setQueryParams, param],
  );

  return <DatePicker value={defaultValue} format={format} onChange={handleChange} {...rest} />;
};

export default DatePickerParam;
