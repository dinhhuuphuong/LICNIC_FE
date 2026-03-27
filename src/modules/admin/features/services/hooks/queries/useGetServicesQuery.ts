import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getServices, type GetServicesParams, type GetServicesResponse } from '@/services/serviceService';

import { adminServicesListQueryKey } from '../queryKeys';

export function useGetServicesQuery(params: GetServicesParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const status = params.status;
  const category = params.category;
  const keyword = params.keyword;

  return useQuery<GetServicesResponse>({
    queryKey: [...adminServicesListQueryKey, page, limit, status ?? null, category ?? null, keyword ?? null],
    queryFn: () => getServices({ page, limit, status, category, keyword }),
    placeholderData: keepPreviousData,
  });
}
