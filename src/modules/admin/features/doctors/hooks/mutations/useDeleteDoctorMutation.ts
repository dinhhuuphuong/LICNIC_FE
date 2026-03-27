import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDoctor, type DeleteDoctorResponse } from '@/services/doctorService';

import { adminDoctorsListQueryKey } from '../queryKeys';

export type UseDeleteDoctorMutationOptions = {
  onSuccess?: (data: DeleteDoctorResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteDoctorMutation(options?: UseDeleteDoctorMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: number) => deleteDoctor(doctorId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorsListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
