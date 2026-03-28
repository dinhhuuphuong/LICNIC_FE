import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getAppointmentsGrouped,
  type GetAppointmentsGroupedParams,
  type GetAppointmentsGroupedResponse,
} from '@/services/statisticsService';

import { adminDashboardAppointmentsGroupedQueryKey } from '../queryKeys';

export function useGetAppointmentsGroupedQuery(params: GetAppointmentsGroupedParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;
  const page = rest.page ?? 1;
  const limit = rest.limit ?? 100;
  const groupBy = rest.groupBy ?? 'day';
  const fromDate = rest.fromDate;
  const toDate = rest.toDate;

  return useQuery<GetAppointmentsGroupedResponse>({
    queryKey: [
      ...adminDashboardAppointmentsGroupedQueryKey,
      'api',
      fromDate ?? null,
      toDate ?? null,
      groupBy,
      page,
      limit,
    ],
    queryFn: () => getAppointmentsGrouped({ fromDate, toDate, groupBy, page, limit }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(fromDate && toDate),
  });
}
