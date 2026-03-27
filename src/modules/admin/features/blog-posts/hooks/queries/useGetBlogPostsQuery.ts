import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getBlogPostsManage,
  type GetBlogPostsManageParams,
  type GetBlogPostsManageResponse,
} from '@/services/blogPostService';

import { adminBlogPostsListQueryKey } from '../queryKeys';

export function useGetBlogPostsQuery(params: GetBlogPostsManageParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const status = params.status;
  const categoryId = params.categoryId;
  const authorId = params.authorId;

  return useQuery<GetBlogPostsManageResponse>({
    queryKey: [...adminBlogPostsListQueryKey, page, limit, status ?? null, categoryId ?? null, authorId ?? null],
    queryFn: () => getBlogPostsManage({ page, limit, status, categoryId, authorId }),
    placeholderData: keepPreviousData,
  });
}
