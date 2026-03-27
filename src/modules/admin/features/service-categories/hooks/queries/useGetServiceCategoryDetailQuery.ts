import { useQuery } from '@tanstack/react-query';

import { getServiceCategoryDetail, type GetServiceCategoryDetailResponse } from '@/services/serviceCategoryService';

import { adminServiceCategoryDetailQueryKey } from '../queryKeys';

export function useGetServiceCategoryDetailQuery(categoryId: number | undefined, enabled: boolean) {
  return useQuery<GetServiceCategoryDetailResponse>({
    queryKey: [...adminServiceCategoryDetailQueryKey, categoryId],
    queryFn: () => {
      if (!categoryId) throw new Error('Missing categoryId');
      return getServiceCategoryDetail(categoryId);
    },
    enabled: Boolean(categoryId) && enabled,
  });
}
