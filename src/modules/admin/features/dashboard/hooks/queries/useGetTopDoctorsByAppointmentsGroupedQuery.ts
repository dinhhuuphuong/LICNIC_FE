import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getTopDoctorsByAppointmentsGrouped,
  type GetTopDoctorsByAppointmentsGroupedParams,
  type GetTopDoctorsByAppointmentsGroupedResponse,
} from '@/services/statisticsService';

import { adminDashboardTopDoctorsByAppointmentsGroupedQueryKey } from '../queryKeys';

export function useGetTopDoctorsByAppointmentsGroupedQuery(
  params: GetTopDoctorsByAppointmentsGroupedParams & { enabled?: boolean },
) {
  const { enabled = true, ...rest } = params;
  const page = rest.page ?? 1;
  const limit = rest.limit ?? 100;
  const groupBy = rest.groupBy ?? 'day';
  const fromDate = rest.fromDate;
  const toDate = rest.toDate;

  return useQuery<GetTopDoctorsByAppointmentsGroupedResponse>({
    queryKey: [
      ...adminDashboardTopDoctorsByAppointmentsGroupedQueryKey,
      'api',
      fromDate ?? null,
      toDate ?? null,
      groupBy,
      page,
      limit,
    ],
    queryFn: () => getTopDoctorsByAppointmentsGrouped({ fromDate, toDate, groupBy, page, limit }),
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(fromDate && toDate),
  });
}
