import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createDoctorWorkSchedule,
  type CreateDoctorWorkSchedulePayload,
  type CreateDoctorWorkScheduleResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export type UseCreateDoctorWorkScheduleMutationOptions = {
  onSuccess?: (data: CreateDoctorWorkScheduleResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateDoctorWorkScheduleMutation(options?: UseCreateDoctorWorkScheduleMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDoctorWorkSchedulePayload) => createDoctorWorkSchedule(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminDoctorWorkSchedulesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
