import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMedicine, type DeleteMedicineResponse } from '@/services/medicineService';

import { adminMedicinesListQueryKey } from '../queryKeys';

export type UseDeleteMedicineMutationOptions = {
  onSuccess?: (data: DeleteMedicineResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteMedicineMutation(options?: UseDeleteMedicineMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicineId: number) => deleteMedicine(medicineId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminMedicinesListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
