import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getPaymentDiscounts,
  type GetPaymentDiscountsParams,
  type GetPaymentDiscountsResponse,
} from '@/services/paymentDiscountService';

import { adminPaymentDiscountsListQueryKey } from '../queryKeys';

export function useGetPaymentDiscountsQuery(params: GetPaymentDiscountsParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const isActive = params.isActive;
  const discountType = params.discountType;

  return useQuery<GetPaymentDiscountsResponse>({
    queryKey: [...adminPaymentDiscountsListQueryKey, page, limit, isActive ?? null, discountType ?? null],
    queryFn: () => getPaymentDiscounts({ page, limit, isActive, discountType }),
    placeholderData: keepPreviousData,
  });
}
