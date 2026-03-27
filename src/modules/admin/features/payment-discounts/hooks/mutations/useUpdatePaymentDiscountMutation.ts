import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  updatePaymentDiscount,
  type UpdatePaymentDiscountPayload,
  type UpdatePaymentDiscountResponse,
} from '@/services/paymentDiscountService';

import { adminPaymentDiscountDetailQueryKey, adminPaymentDiscountsListQueryKey } from '../queryKeys';

export type UseUpdatePaymentDiscountMutationOptions = {
  onSuccess?: (data: UpdatePaymentDiscountResponse) => void;
  onError?: (error: unknown) => void;
};

export function useUpdatePaymentDiscountMutation(options?: UseUpdatePaymentDiscountMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ discountId, payload }: { discountId: number; payload: UpdatePaymentDiscountPayload }) =>
      updatePaymentDiscount(discountId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPaymentDiscountsListQueryKey });
      queryClient.invalidateQueries({ queryKey: [...adminPaymentDiscountDetailQueryKey, variables.discountId] });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
