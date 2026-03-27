import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  setDoctorServices,
  type SetDoctorServicesPayload,
  type SetDoctorServicesResponse,
} from '@/services/doctorService';

import { adminDoctorServicesQueryKey } from '@/modules/admin/features/doctors/hooks/queryKeys';

export type UseSetDoctorServicesMutationOptions = {
  onSuccess?: (data: SetDoctorServicesResponse) => void;
  onError?: (error: unknown) => void;
};

export function useSetDoctorServicesMutation(options?: UseSetDoctorServicesMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, payload }: { doctorId: number; payload: SetDoctorServicesPayload }) =>
      setDoctorServices(doctorId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: [...adminDoctorServicesQueryKey, variables.doctorId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
