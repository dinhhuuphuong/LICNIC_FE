import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteService, type DeleteServiceResponse } from '@/services/serviceService';

import { adminServicesListQueryKey } from '../queryKeys';

export type UseDeleteServiceMutationOptions = {
  onSuccess?: (data: DeleteServiceResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteServiceMutation(options?: UseDeleteServiceMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: number) => deleteService(serviceId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminServicesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
