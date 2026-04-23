import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  rejectDoctorWorkScheduleByAdmin,
  type RejectDoctorWorkSchedulePayload,
  type RejectDoctorWorkScheduleResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export type UseRejectDoctorWorkScheduleMutationOptions = {
  onSuccess?: (data: RejectDoctorWorkScheduleResponse) => void;
  onError?: (error: unknown) => void;
};

export function useRejectDoctorWorkScheduleMutation(options?: UseRejectDoctorWorkScheduleMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: number; payload: RejectDoctorWorkSchedulePayload }) =>
      rejectDoctorWorkScheduleByAdmin(scheduleId, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorWorkSchedulesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
