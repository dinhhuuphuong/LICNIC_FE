import { useQuery } from '@tanstack/react-query';

import { getDoctorServices, type GetDoctorServicesResponse } from '@/services/doctorService';

import { adminDoctorServicesQueryKey } from '@/modules/admin/features/doctors/hooks/queryKeys';

export function useGetDoctorServicesQuery(doctorId: number | undefined, enabled: boolean) {
  return useQuery<GetDoctorServicesResponse>({
    queryKey: [...adminDoctorServicesQueryKey, doctorId],
    queryFn: () => {
      if (!doctorId) throw new Error('Missing doctorId');
      return getDoctorServices(doctorId);
    },
    enabled: Boolean(doctorId) && enabled,
  });
}
