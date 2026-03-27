import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createServiceCategory,
  type CreateServiceCategoryPayload,
  type CreateServiceCategoryResponse,
} from '@/services/serviceCategoryService';

import { adminServiceCategoriesListQueryKey } from '../queryKeys';

export type UseCreateServiceCategoryMutationOptions = {
  onSuccess?: (data: CreateServiceCategoryResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateServiceCategoryMutation(options?: UseCreateServiceCategoryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceCategoryPayload) => createServiceCategory(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminServiceCategoriesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
