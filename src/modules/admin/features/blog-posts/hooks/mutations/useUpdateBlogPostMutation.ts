import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateBlogPost, type UpdateBlogPostPayload, type UpdateBlogPostResponse } from '@/services/blogPostService';

import { adminBlogPostDetailQueryKey, adminBlogPostsListQueryKey } from '../queryKeys';

export type UseUpdateBlogPostMutationOptions = {
  onSuccess?: (data: UpdateBlogPostResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateBlogPostMutation(options?: UseUpdateBlogPostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: UpdateBlogPostPayload }) =>
      updateBlogPost(postId, payload),
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
