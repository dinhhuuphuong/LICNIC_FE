import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createUser, type CreateUserPayload, type CreateUserResponse } from '@/services/userService';

import { adminUsersListQueryKey } from '../queryKeys';

export type UseCreateUserMutationOptions = {
  onSuccess?: (data: CreateUserResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreateUserMutation(options?: UseCreateUserMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: (res) => {
      // Invalidate admin users list so `UsersTable` refetches automatically.
      queryClient.invalidateQueries({ queryKey: adminUsersListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
