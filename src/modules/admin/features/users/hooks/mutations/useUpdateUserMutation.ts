import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUser, type UpdateUserPayload, type UpdateUserResponse } from '@/services/userService';

import { adminUserDetailQueryKey, adminUsersListQueryKey } from '../queryKeys';

export type UseUpdateUserMutationOptions = {
  onSuccess?: (data: UpdateUserResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdateUserMutation(options?: UseUpdateUserMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateUserPayload }) => updateUser(userId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUsersListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminUserDetailQueryKey, variables.userId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
