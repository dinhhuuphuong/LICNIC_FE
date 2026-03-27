import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getServiceCategories,
  type GetServiceCategoriesParams,
  type GetServiceCategoriesResponse,
} from '@/services/serviceCategoryService';

import { adminServiceCategoriesListQueryKey } from '../queryKeys';

export function useGetServiceCategoriesQuery(params: GetServiceCategoriesParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const keyword = params.keyword ?? '';

  return useQuery<GetServiceCategoriesResponse>({
    queryKey: [...adminServiceCategoriesListQueryKey, page, limit, keyword],
    queryFn: () => getServiceCategories({ page, limit, keyword }),
    placeholderData: keepPreviousData,
  });
}
