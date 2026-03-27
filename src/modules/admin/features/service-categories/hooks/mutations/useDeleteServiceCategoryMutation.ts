import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteServiceCategory, type DeleteServiceCategoryResponse } from '@/services/serviceCategoryService';

import { adminServiceCategoriesListQueryKey } from '../queryKeys';

export type UseDeleteServiceCategoryMutationOptions = {
  onSuccess?: (data: DeleteServiceCategoryResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteServiceCategoryMutation(options?: UseDeleteServiceCategoryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => deleteServiceCategory(categoryId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminServiceCategoriesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
