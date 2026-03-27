import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  updateDoctorWorkSchedule,
  type UpdateDoctorWorkSchedulePayload,
  type UpdateDoctorWorkScheduleResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkScheduleDetailQueryKey, adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export type UseUpdateDoctorWorkScheduleMutationOptions = {
  onSuccess?: (data: UpdateDoctorWorkScheduleResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateDoctorWorkScheduleMutation(options?: UseUpdateDoctorWorkScheduleMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: number; payload: UpdateDoctorWorkSchedulePayload }) =>
      updateDoctorWorkSchedule(scheduleId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorWorkSchedulesListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminDoctorWorkScheduleDetailQueryKey, variables.scheduleId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
