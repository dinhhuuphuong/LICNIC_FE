import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateService, type UpdateServicePayload, type UpdateServiceResponse } from '@/services/serviceService';

import { adminServiceDetailQueryKey, adminServicesListQueryKey } from '../queryKeys';

export type UseUpdateServiceMutationOptions = {
  onSuccess?: (data: UpdateServiceResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateServiceMutation(options?: UseUpdateServiceMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, payload }: { serviceId: number; payload: UpdateServicePayload }) =>
      updateService(serviceId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminServicesListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminServiceDetailQueryKey, variables.serviceId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
