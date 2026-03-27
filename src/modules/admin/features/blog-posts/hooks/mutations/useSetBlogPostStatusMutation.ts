import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setBlogPostStatus, type BlogPostStatus, type SetBlogPostStatusResponse } from '@/services/blogPostService';

import { adminBlogPostDetailQueryKey, adminBlogPostsListQueryKey } from '../queryKeys';

export type UseSetBlogPostStatusMutationOptions = {
  onSuccess?: (data: SetBlogPostStatusResponse) => void;
  onError?: (error: unknown) => void;
};

export function useSetBlogPostStatusMutation(options?: UseSetBlogPostStatusMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, status }: { postId: number; status: BlogPostStatus }) => setBlogPostStatus(postId, status),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminBlogPostsListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminBlogPostDetailQueryKey, variables.postId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
