import { useQuery } from '@tanstack/react-query';

import { getClinicInfo, type GetClinicInfoResponse } from '@/services/clinicInfoService';

import { clinicInfoQueryKey } from '../queryKeys';

export function useGetClinicInfoQuery() {
  return useQuery<GetClinicInfoResponse>({
    queryKey: clinicInfoQueryKey,
    queryFn: getClinicInfo,
  });
}
