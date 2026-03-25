import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteUser, type DeleteUserResponse } from '@/services/userService';

import { adminUsersListQueryKey } from '../queryKeys';

export type UseDeleteUserMutationOptions = {
  onSuccess?: (data: DeleteUserResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeleteUserMutation(options?: UseDeleteUserMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminUsersListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
