import DATE_FORMAT from '@/constants/date-format';
import { DatePicker, type DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

const getFormat = (mode: string) => {
  switch (mode) {
    case 'month':
      return 'MM/YYYY';
    case 'year':
      return 'YYYY';
    case 'quarter':
      return '[Q]Q/YYYY';
    default:
      return undefined;
  }
};

const calculateDateRange = (date: dayjs.Dayjs, mode: string) => {
  let fromDate: dayjs.Dayjs;
  let toDate: dayjs.Dayjs;

  switch (mode) {
    case 'month':
      fromDate = date.startOf('month');
      toDate = date.endOf('month');
      break;
    case 'quarter': {
      // Tính quý: Q1 (0-2), Q2 (3-5), Q3 (6-8), Q4 (9-11)
      const month = date.month();
      const quarter = Math.floor(month / 3);
      fromDate = date.month(quarter * 3).startOf('month');
      toDate = date.month(quarter * 3 + 2).endOf('month');
      break;
    }
    case 'year':
      fromDate = date.startOf('year');
      toDate = date.endOf('year');
      break;
    default:
      fromDate = date.startOf('month');
      toDate = date.endOf('month');
  }

  return {
    fromDate: fromDate.format(DATE_FORMAT.DB_DATE),
    toDate: toDate.format(DATE_FORMAT.DB_DATE),
  };
};

const DatePickerParam = (props: DatePickerProps) => {
  const { allowClear, defaultValue: defaultValueProps } = props;
  const defaultValue = defaultValueProps
    ? Array.isArray(defaultValueProps)
      ? defaultValueProps[0]
      : defaultValueProps
    : undefined;

  const [query, setQuery] = useQueryParams({
    date: withDefault(StringParam, defaultValue?.toISOString()),
    dateMode: withDefault(StringParam, 'month'),
    fromDate: withDefault(StringParam, undefined),
    toDate: withDefault(StringParam, undefined),
  });

  const date = query.date ? dayjs(query.date) : defaultValue;
  const mode = query.dateMode || 'month';

  // Tự động cập nhật fromDate và toDate khi mode hoặc date thay đổi
  useEffect(() => {
    const currentDate = query.date ? dayjs(query.date) : defaultValue;
    if (currentDate && currentDate.isValid()) {
      const { fromDate, toDate } = calculateDateRange(currentDate, query.dateMode || 'month');
      setQuery({ fromDate, toDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.dateMode, query.date]);

  const onDatePickerChange: DatePickerProps['onChange'] = (dateParam) => {
    const date = Array.isArray(dateParam) ? dateParam[0] : dateParam;

    if (!date || date === null) {
      setQuery({ date: undefined, fromDate: undefined, toDate: undefined });
    } else {
      const { fromDate, toDate } = calculateDateRange(date, mode);
      setQuery({ date: date?.toISOString(), fromDate, toDate });
    }
  };

  return (
    <DatePicker
      mode={mode as DatePickerProps['mode']}
      className="w-[150px]"
      allowClear={allowClear}
      value={date}
      format={getFormat(mode)}
      placeholder="Tháng/Năm"
      onChange={onDatePickerChange}
      onPanelChange={onDatePickerChange}
      cellRender={(current, info) => {
        if (info.type === 'month') {
          return <div className="ant-picker-cell-inner">T{dayjs(current).format('MM')}</div>;
        }
        return info.originNode;
      }}
    />
  );
};

export default DatePickerParam;
