import { http, type PaginationResponse, type Response } from '@/services/http';

export type PaymentDiscountType = 'percent' | 'amount';

export type PaymentDiscountService = {
  discountId: number;
  serviceId: number;
  createdAt?: string | null;
};

export type PaymentDiscountUser = {
  discountId: number;
  userId: number;
  createdAt?: string | null;
};

export type PaymentDiscount = {
  discountId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  appliesAllServices: boolean;
  appliesAllUsers: boolean;
  startAt?: string | null;
  endAt?: string | null;
  limitPerUser?: number | null;
  discountType: PaymentDiscountType;
  discountValue: number;
  createdAt: string;
  deletedAt?: string | null;
  paymentDiscountServices: PaymentDiscountService[];
  paymentDiscountUsers: PaymentDiscountUser[];
};

export type GetPaymentDiscountsResponse = PaginationResponse<PaymentDiscount>;

export type GetPaymentDiscountsParams = {
  limit?: number;
  page?: number;
  isActive?: boolean;
  discountType?: PaymentDiscountType;
};

const PAYMENT_DISCOUNTS_URL = '/payment-discounts';

export function getPaymentDiscounts(params: GetPaymentDiscountsParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const queryParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (params.isActive !== undefined) {
    queryParams.set('isActive', String(params.isActive));
  }

  if (params.discountType) {
    queryParams.set('discountType', params.discountType);
  }

  return http<GetPaymentDiscountsResponse>(`${PAYMENT_DISCOUNTS_URL}?${queryParams.toString()}`);
}

export type GetPaymentDiscountDetailResponse = Response<PaymentDiscount>;

export function getPaymentDiscountDetail(discountId: number) {
  return http<GetPaymentDiscountDetailResponse>(`${PAYMENT_DISCOUNTS_URL}/${discountId}`);
}

export type CreatePaymentDiscountPayload = {
  name: string;
  description?: string;
  appliesAllServices?: boolean;
  serviceIds?: number[];
  appliesAllUsers?: boolean;
  userIds?: number[];
  startAt?: string | null;
  endAt?: string | null;
  limitPerUser?: number | null;
  discountType: PaymentDiscountType;
  discountValue: number;
  isActive?: boolean;
};

export type CreatePaymentDiscountResponse = Response<PaymentDiscount>;

export function createPaymentDiscount(payload: CreatePaymentDiscountPayload) {
  return http<CreatePaymentDiscountResponse>(PAYMENT_DISCOUNTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdatePaymentDiscountPayload = Partial<CreatePaymentDiscountPayload>;

export type UpdatePaymentDiscountResponse = Response<PaymentDiscount>;

export function updatePaymentDiscount(discountId: number, payload: UpdatePaymentDiscountPayload) {
  return http<UpdatePaymentDiscountResponse>(`${PAYMENT_DISCOUNTS_URL}/${discountId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeletePaymentDiscountResponse = Response<null>;

export function deletePaymentDiscount(discountId: number) {
  return http<DeletePaymentDiscountResponse>(`${PAYMENT_DISCOUNTS_URL}/${discountId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
