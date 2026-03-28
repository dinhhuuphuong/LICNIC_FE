import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getRevenueGrouped,
  type GetRevenueGroupedParams,
  type GetRevenueGroupedResponse,
} from '@/services/statisticsService';

import { adminDashboardRevenueGroupedQueryKey } from '../queryKeys';

export function useGetRevenueGroupedQuery(params: GetRevenueGroupedParams & { enabled?: boolean }) {
  const { enabled = true, ...rest } = params;
  const page = rest.page ?? 1;
  const limit = rest.limit ?? 100;
  const groupBy = rest.groupBy ?? 'day';
  const fromDate = rest.fromDate;
  const toDate = rest.toDate;

  return useQuery<GetRevenueGroupedResponse>({
    queryKey: [...adminDashboardRevenueGroupedQueryKey, 'api', fromDate ?? null, toDate ?? null, groupBy, page, limit],
    queryFn: () => getRevenueGrouped({ fromDate, toDate, groupBy, page, limit }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(fromDate && toDate),
  });
}
