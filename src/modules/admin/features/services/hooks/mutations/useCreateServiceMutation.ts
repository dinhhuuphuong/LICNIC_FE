import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createService, type CreateServicePayload, type CreateServiceResponse } from '@/services/serviceService';

import { adminServicesListQueryKey } from '../queryKeys';

export type UseCreateServiceMutationOptions = {
  onSuccess?: (data: CreateServiceResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateServiceMutation(options?: UseCreateServiceMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServicePayload) => createService(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminServicesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
