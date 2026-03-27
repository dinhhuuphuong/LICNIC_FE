import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateDoctor, type UpdateDoctorPayload, type UpdateDoctorResponse } from '@/services/doctorService';

import { adminDoctorDetailQueryKey, adminDoctorsListQueryKey } from '../queryKeys';

export type UseUpdateDoctorMutationOptions = {
  onSuccess?: (data: UpdateDoctorResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateDoctorMutation(options?: UseUpdateDoctorMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, payload }: { doctorId: number; payload: UpdateDoctorPayload }) =>
      updateDoctor(doctorId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorsListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminDoctorDetailQueryKey, variables.doctorId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
