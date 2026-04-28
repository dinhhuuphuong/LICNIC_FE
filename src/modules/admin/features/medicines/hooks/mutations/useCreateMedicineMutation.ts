import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createMedicine, type CreateMedicinePayload, type CreateMedicineResponse } from '@/services/medicineService';

import { adminMedicinesListQueryKey } from '../queryKeys';

export type UseCreateMedicineMutationOptions = {
  onSuccess?: (data: CreateMedicineResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateMedicineMutation(options?: UseCreateMedicineMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMedicinePayload) => createMedicine(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminMedicinesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
