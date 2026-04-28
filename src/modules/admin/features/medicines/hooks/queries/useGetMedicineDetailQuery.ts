import { useQuery } from '@tanstack/react-query';

import { getMedicineDetail, type GetMedicineDetailResponse } from '@/services/medicineService';

import { adminMedicineDetailQueryKey } from '../queryKeys';

export function useGetMedicineDetailQuery(medicineId: number | undefined, enabled: boolean) {
  return useQuery<GetMedicineDetailResponse>({
    queryKey: [...adminMedicineDetailQueryKey, medicineId],
    queryFn: () => {
      if (!medicineId) throw new Error('Missing medicineId');
      return getMedicineDetail(medicineId);
    },
    enabled: Boolean(medicineId) && enabled,
  });
}
