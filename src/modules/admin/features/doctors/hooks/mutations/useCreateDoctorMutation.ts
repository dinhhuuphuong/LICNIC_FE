import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDoctor, type CreateDoctorPayload, type CreateDoctorResponse } from '@/services/doctorService';

import { adminDoctorsListQueryKey } from '../queryKeys';

export type UseCreateDoctorMutationOptions = {
  onSuccess?: (data: CreateDoctorResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateDoctorMutation(options?: UseCreateDoctorMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDoctorPayload) => createDoctor(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorsListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
