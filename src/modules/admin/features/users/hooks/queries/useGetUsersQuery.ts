import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getUsers, type GetUsersParams, type GetUsersResponse } from '@/services/userService';

import { adminUsersListQueryKey } from '../queryKeys';

export function useGetUsersQuery(params: GetUsersParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  return useQuery<GetUsersResponse>({
    queryKey: [...adminUsersListQueryKey, page, limit],
    queryFn: () => getUsers({ page, limit }),
    placeholderData: keepPreviousData,
  });
}
