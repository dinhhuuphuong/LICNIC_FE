import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  updateServiceCategory,
  type UpdateServiceCategoryPayload,
  type UpdateServiceCategoryResponse,
} from '@/services/serviceCategoryService';

import { adminServiceCategoriesListQueryKey, adminServiceCategoryDetailQueryKey } from '../queryKeys';

export type UseUpdateServiceCategoryMutationOptions = {
  onSuccess?: (data: UpdateServiceCategoryResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateServiceCategoryMutation(options?: UseUpdateServiceCategoryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: number; payload: UpdateServiceCategoryPayload }) =>
      updateServiceCategory(categoryId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminServiceCategoriesListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminServiceCategoryDetailQueryKey, variables.categoryId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
