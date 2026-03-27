import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDoctorWorkSchedule, type DeleteDoctorWorkScheduleResponse } from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export type UseDeleteDoctorWorkScheduleMutationOptions = {
  onSuccess?: (data: DeleteDoctorWorkScheduleResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteDoctorWorkScheduleMutation(options?: UseDeleteDoctorWorkScheduleMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => deleteDoctorWorkSchedule(scheduleId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorWorkSchedulesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
