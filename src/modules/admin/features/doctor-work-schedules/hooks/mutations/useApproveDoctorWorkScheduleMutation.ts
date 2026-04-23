import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  approveDoctorWorkScheduleByAdmin,
  type ApproveDoctorWorkScheduleResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export type UseApproveDoctorWorkScheduleMutationOptions = {
  onSuccess?: (data: ApproveDoctorWorkScheduleResponse) => void;
  onError?: (error: unknown) => void;
};

export function useApproveDoctorWorkScheduleMutation(options?: UseApproveDoctorWorkScheduleMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => approveDoctorWorkScheduleByAdmin(scheduleId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorWorkSchedulesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
