import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMedicine, type UpdateMedicinePayload, type UpdateMedicineResponse } from '@/services/medicineService';

import { adminMedicineDetailQueryKey, adminMedicinesListQueryKey } from '../queryKeys';

export type UseUpdateMedicineMutationOptions = {
  onSuccess?: (data: UpdateMedicineResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateMedicineMutation(options?: UseUpdateMedicineMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicineId, payload }: { medicineId: number; payload: UpdateMedicinePayload }) =>
      updateMedicine(medicineId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminMedicinesListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminMedicineDetailQueryKey, variables.medicineId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
