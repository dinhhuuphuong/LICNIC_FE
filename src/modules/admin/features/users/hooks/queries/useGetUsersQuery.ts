import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getUsers, type GetUsersParams, type GetUsersResponse } from '@/services/userService';

import { adminUsersListQueryKey } from '../queryKeys';

export function useGetUsersQuery(params: GetUsersParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const role = params.role;
  const status = params.status;
  const keyword = params.keyword;

  return useQuery<GetUsersResponse>({
    queryKey: [...adminUsersListQueryKey, page, limit, role ?? null, status ?? null, keyword ?? null],
    queryFn: () => getUsers({ page, limit, role, status, keyword }),
    placeholderData: keepPreviousData,
  });
}
