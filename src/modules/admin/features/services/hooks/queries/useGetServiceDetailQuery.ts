import { useQuery } from '@tanstack/react-query';

import { getServiceDetail, type GetServiceDetailResponse } from '@/services/serviceService';

import { adminServiceDetailQueryKey } from '../queryKeys';

export function useGetServiceDetailQuery(serviceId: number | undefined, enabled: boolean) {
  return useQuery<GetServiceDetailResponse>({
    queryKey: [...adminServiceDetailQueryKey, serviceId],
    queryFn: () => {
      if (!serviceId) throw new Error('Missing serviceId');
      return getServiceDetail(serviceId);
    },
    enabled: Boolean(serviceId) && enabled,
  });
}
