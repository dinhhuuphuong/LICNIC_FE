import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getTopServicesByDoctorGrouped,
  type GetTopServicesByDoctorGroupedParams,
  type GetTopServicesByDoctorGroupedResponse,
} from '@/services/statisticsService';

import { adminDashboardTopServicesByDoctorGroupedQueryKey } from '../queryKeys';

export function useGetTopServicesByDoctorGroupedQuery(
  params: GetTopServicesByDoctorGroupedParams & { enabled?: boolean },
) {
  const { enabled = true, ...rest } = params;
  const page = rest.page ?? 1;
  const limit = rest.limit ?? 100;
  const groupBy = rest.groupBy ?? 'day';
  const fromDate = rest.fromDate;
  const toDate = rest.toDate;

  return useQuery<GetTopServicesByDoctorGroupedResponse>({
    queryKey: [
      ...adminDashboardTopServicesByDoctorGroupedQueryKey,
      'api',
      fromDate ?? null,
      toDate ?? null,
      groupBy,
      page,
      limit,
    ],
    queryFn: () => getTopServicesByDoctorGrouped({ fromDate, toDate, groupBy, page, limit }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(fromDate && toDate),
  });
}
