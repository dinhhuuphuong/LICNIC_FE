import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  generateDoctorWorkSchedulesAdmin,
  type GenerateDoctorWorkSchedulesAdminPayload,
  type GenerateDoctorWorkSchedulesAdminResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export type UseGenerateDoctorWorkSchedulesMutationOptions = {
  onSuccess?: (data: GenerateDoctorWorkSchedulesAdminResponse) => void;
  onError?: (error: unknown) => void;
};

export function useGenerateDoctorWorkSchedulesMutation(options?: UseGenerateDoctorWorkSchedulesMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateDoctorWorkSchedulesAdminPayload) => generateDoctorWorkSchedulesAdmin(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorWorkSchedulesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
