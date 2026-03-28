import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getRevenueByDoctorGrouped,
  type GetRevenueByDoctorGroupedParams,
  type GetRevenueByDoctorGroupedResponse,
} from '@/services/statisticsService';

import { adminDashboardRevenueByDoctorGroupedQueryKey } from '../queryKeys';

export function useGetRevenueByDoctorGroupedQuery(params: GetRevenueByDoctorGroupedParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;
  const page = rest.page ?? 1;
  const limit = rest.limit ?? 100;
  const groupBy = rest.groupBy ?? 'day';
  const fromDate = rest.fromDate;
  const toDate = rest.toDate;

  return useQuery<GetRevenueByDoctorGroupedResponse>({
    queryKey: [
      ...adminDashboardRevenueByDoctorGroupedQueryKey,
      'api',
      fromDate ?? null,
      toDate ?? null,
      groupBy,
      page,
      limit,
    ],
    queryFn: () => getRevenueByDoctorGrouped({ fromDate, toDate, groupBy, page, limit }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(fromDate && toDate),
  });
}
