import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createPaymentDiscount,
  type CreatePaymentDiscountPayload,
  type CreatePaymentDiscountResponse,
} from '@/services/paymentDiscountService';

import { adminPaymentDiscountsListQueryKey } from '../queryKeys';

export type UseCreatePaymentDiscountMutationOptions = {
  onSuccess?: (data: CreatePaymentDiscountResponse) => void;
  onError?: (error: unknown) => void;
};

export function useCreatePaymentDiscountMutation(options?: UseCreatePaymentDiscountMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentDiscountPayload) => createPaymentDiscount(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: adminPaymentDiscountsListQueryKey });
      options?.onSuccess?.(res);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
