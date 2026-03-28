import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { AppointmentGroupBy } from '@/services/statisticsService';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const useDashboardParams = () => {
  const [searchParams] = useSearchParams();
  const groupBy = (searchParams.get(SEARCH_PARAMS.DATE_MODE) || 'day') as AppointmentGroupBy;
  const fromDate = searchParams.get(SEARCH_PARAMS.FROM_DATE) || dayjs().startOf('month').format(DATE_FORMAT.DB_DATE);
  const toDate = searchParams.get(SEARCH_PARAMS.TO_DATE) || dayjs().endOf('month').format(DATE_FORMAT.DB_DATE);

  const params = useMemo(
    () => ({
      fromDate,
      toDate,
      groupBy,
      page: 1,
      limit: 100,
    }),
    [fromDate, groupBy, toDate],
  );

  return params;
};

export default useDashboardParams;
