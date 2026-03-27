import { useQuery } from '@tanstack/react-query';

import { getPaymentDiscountDetail, type GetPaymentDiscountDetailResponse } from '@/services/paymentDiscountService';

import { adminPaymentDiscountDetailQueryKey } from '../queryKeys';

export function useGetPaymentDiscountDetailQuery(discountId: number | undefined, enabled: boolean) {
  return useQuery<GetPaymentDiscountDetailResponse>({
    queryKey: [...adminPaymentDiscountDetailQueryKey, discountId],
    queryFn: () => {
      if (!discountId) throw new Error('Missing discountId');
      return getPaymentDiscountDetail(discountId);
    },
    enabled: Boolean(discountId) && enabled,
  });
}
