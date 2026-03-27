import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteBlogPost, type DeleteBlogPostResponse } from '@/services/blogPostService';

import { adminBlogPostsListQueryKey } from '../queryKeys';

export type UseDeleteBlogPostMutationOptions = {
  onSuccess?: (data: DeleteBlogPostResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteBlogPostMutation(options?: UseDeleteBlogPostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deleteBlogPost(postId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminBlogPostsListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
