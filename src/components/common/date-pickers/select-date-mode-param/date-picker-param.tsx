import DATE_FORMAT from '@/constants/date-format';
import { DatePicker, type DatePickerProps } from 'antd';
import viVN from 'antd/es/date-picker/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import isoWeek from 'dayjs/plugin/isoWeek';
import updateLocale from 'dayjs/plugin/updateLocale';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useEffect, useRef } from 'react';
import { StringParam, useQueryParams, withDefault } from 'use-query-params';

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(updateLocale);
dayjs.updateLocale('vi', { weekStart: 1 });
dayjs.locale('vi');

const getFormat = (mode: string) => {
  switch (mode) {
    case 'day':
      return DATE_FORMAT.DATE;
    case 'week':
      return 'WW/YYYY';
    case 'month':
      return DATE_FORMAT.MONTH_YEAR;
    case 'year':
      return DATE_FORMAT.YEAR;
    case 'quarter':
      return '[Q]Q/YYYY';
    default:
      return DATE_FORMAT.DATE;
  }
};

const getPlaceholder = (mode: string) => {
  switch (mode) {
    case 'day':
      return 'Ngày/Tháng/Năm';
    case 'week':
      return 'Tuần/Năm';
    case 'month':
      return 'Tháng/Năm';
    case 'year':
      return 'Năm';
    case 'quarter':
      return 'Quý/Năm';
    default:
      return 'Ngày/Tháng/Năm';
  }
};

const getPicker = (mode: string): DatePickerProps['picker'] => {
  switch (mode) {
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    case 'year':
      return 'year';
    case 'quarter':
      return 'quarter';
    default:
      return 'date';
  }
};

const datePickerLocale = {
  ...viVN,
  lang: {
    ...viVN.lang,
    weekStart: 1,
  },
};

const calculateDateRange = (date: dayjs.Dayjs, mode: string) => {
  let fromDate: dayjs.Dayjs;
  let toDate: dayjs.Dayjs;

  switch (mode) {
    case 'day':
      fromDate = date.startOf('day');
      toDate = date.endOf('day');
      break;
    case 'week':
      // Cố định tuần theo chuẩn VN: Thứ 2 -> Chủ nhật
      fromDate = date.isoWeekday(1).startOf('day');
      toDate = date.isoWeekday(7).endOf('day');
      break;
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
  const picker = getPicker(mode);
  const prevModeRef = useRef(mode);

  // Tự động cập nhật fromDate và toDate khi mode hoặc date thay đổi
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      const now = dayjs();
      const { fromDate, toDate } = calculateDateRange(now, mode);
      setQuery({ date: now.toISOString(), fromDate, toDate });
      prevModeRef.current = mode;
      return;
    }

    const currentDate = query.date ? dayjs(query.date) : defaultValue;
    if (currentDate && currentDate.isValid()) {
      const { fromDate, toDate } = calculateDateRange(currentDate, mode);
      setQuery({ fromDate, toDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, query.date]);

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
      picker={picker}
      locale={datePickerLocale}
      className="w-[150px]"
      allowClear={allowClear}
      value={date}
      format={getFormat(mode)}
      placeholder={getPlaceholder(mode)}
      onChange={onDatePickerChange}
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
