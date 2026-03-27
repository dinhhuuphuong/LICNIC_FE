import { useQuery } from '@tanstack/react-query';

import { getDoctorDetail, type GetDoctorDetailResponse } from '@/services/doctorService';

import { adminDoctorDetailQueryKey } from '../queryKeys';

export function useGetDoctorDetailQuery(doctorId: number | undefined, enabled: boolean) {
  return useQuery<GetDoctorDetailResponse>({
    queryKey: [...adminDoctorDetailQueryKey, doctorId],
    queryFn: () => {
      if (!doctorId) throw new Error('Missing doctorId');
      return getDoctorDetail(doctorId);
    },
    enabled: Boolean(doctorId) && enabled,
  });
}
