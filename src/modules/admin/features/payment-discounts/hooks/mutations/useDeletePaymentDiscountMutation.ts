import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePaymentDiscount, type DeletePaymentDiscountResponse } from '@/services/paymentDiscountService';

import { adminPaymentDiscountsListQueryKey } from '../queryKeys';

export type UseDeletePaymentDiscountMutationOptions = {
  onSuccess?: (data: DeletePaymentDiscountResponse) => void;
  onError?: (error: unknown) => void;
};

export function useDeletePaymentDiscountMutation(options?: UseDeletePaymentDiscountMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discountId: number) => deletePaymentDiscount(discountId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminPaymentDiscountsListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
