import { useQuery } from '@tanstack/react-query';

import { getBlogPostDetail, type GetBlogPostDetailResponse } from '@/services/blogPostService';

import { adminBlogPostDetailQueryKey } from '../queryKeys';

export function useGetBlogPostDetailQuery(postId: number | undefined, enabled: boolean) {
  return useQuery<GetBlogPostDetailResponse>({
    queryKey: [...adminBlogPostDetailQueryKey, postId],
    queryFn: () => {
      if (!postId) throw new Error('Missing postId');
      return getBlogPostDetail(postId);
    },
    enabled: Boolean(postId) && enabled,
  });
}
