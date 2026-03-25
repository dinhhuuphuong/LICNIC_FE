import { useQuery } from '@tanstack/react-query';

import { getUserDetail, type GetUserDetailResponse } from '@/services/userService';

import { adminUserDetailQueryKey } from '../queryKeys';

export function useGetUserDetailQuery(userId: number | undefined, enabled: boolean) {
  return useQuery<GetUserDetailResponse>({
    queryKey: [...adminUserDetailQueryKey, userId],
    queryFn: () => {
      if (!userId) throw new Error('Missing userId');
      return getUserDetail(userId);
    },
    enabled: Boolean(userId) && enabled,
  });
}
