import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getTopServicesByAppointmentsGrouped,
  type GetTopServicesByAppointmentsGroupedParams,
  type GetTopServicesByAppointmentsGroupedResponse,
} from '@/services/statisticsService';

import { adminDashboardTopServicesByAppointmentsGroupedQueryKey } from '../queryKeys';

export function useGetTopServicesByAppointmentsGroupedQuery(
  params: GetTopServicesByAppointmentsGroupedParams & { enabled?: boolean },
) {
  const { enabled = true, ...rest } = params;
  const page = rest.page ?? 1;
  const limit = rest.limit ?? 100;
  const groupBy = rest.groupBy ?? 'day';
  const fromDate = rest.fromDate;
  const toDate = rest.toDate;

  return useQuery<GetTopServicesByAppointmentsGroupedResponse>({
    queryKey: [
      ...adminDashboardTopServicesByAppointmentsGroupedQueryKey,
      'api',
      fromDate ?? null,
      toDate ?? null,
      groupBy,
      page,
      limit,
    ],
    queryFn: () => getTopServicesByAppointmentsGrouped({ fromDate, toDate, groupBy, page, limit }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(fromDate && toDate),
  });
}
