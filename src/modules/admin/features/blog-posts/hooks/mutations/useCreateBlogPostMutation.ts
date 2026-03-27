import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBlogPost, type CreateBlogPostPayload, type CreateBlogPostResponse } from '@/services/blogPostService';

import { adminBlogPostsListQueryKey } from '../queryKeys';

export type UseCreateBlogPostMutationOptions = {
  onSuccess?: (data: CreateBlogPostResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateBlogPostMutation(options?: UseCreateBlogPostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBlogPostPayload) => createBlogPost(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminBlogPostsListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
