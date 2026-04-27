import { http, type PaginationResponse, type Response } from '@/services/http';

export type CreateReceptionistPaymentFromAppointmentPayload = {
  appointmentId: number;
  paymentMethod: 'cash' | 'bank' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  transactionId?: string;
  invoiceNumber?: string;
  paidAt?: string;
  note?: string;
  paymentDiscountId?: number;
};

export type PaymentEntity = {
  paymentId: number;
  appointmentId: number;
  amount?: number;
  baseAmount?: number;
  discountAmount?: number | null;
  appliedDiscountId?: number | null;
  payerUserId?: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  invoiceNumber: string | null;
  paidAt: string | null;
  note: string | null;
  paymentDiscountId?: number | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  appointment?: {
    appointmentId: number;
    patientId: number;
    doctorId: number;
    serviceId: number;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    note: string | null;
    createdAt: string;
    scheduleId: number | null;
    checkedInAt: string | null;
    respondedAt: string | null;
    cancelledBy: number | null;
    cancellationReason: string | null;
    updatedAt: string;
  };
};

export type GetReceptionistPaymentsParams = {
  appointmentId?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  page?: number;
  limit?: number;
};

export type GetReceptionistPaymentsResponse = PaginationResponse<PaymentEntity>;

export type ApplicablePaymentDiscount = {
  discountId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  appliesAllServices: boolean;
  appliesAllUsers: boolean;
  startAt?: string | null;
  endAt?: string | null;
  limitPerUser?: number | null;
  discountType: 'percent' | 'amount';
  discountValue: number;
  createdAt: string;
  deletedAt?: string | null;
  bestDiscountAmount?: number | null;
};

export type CreateReceptionistPaymentFromAppointmentResponse = Response<PaymentEntity>;

const PAYMENTS_URL = '/payments';

export function getReceptionistPayments(params: GetReceptionistPaymentsParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params.appointmentId) queryParams.set('appointmentId', String(params.appointmentId));
  if (params.paymentStatus) queryParams.set('paymentStatus', params.paymentStatus);

  return http<GetReceptionistPaymentsResponse>(`${PAYMENTS_URL}?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}

export function createReceptionistPaymentFromAppointment(payload: CreateReceptionistPaymentFromAppointmentPayload) {
  return http<CreateReceptionistPaymentFromAppointmentResponse>(`${PAYMENTS_URL}/receptionist/from-appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type GetReceptionistPaymentDetailResponse = Response<PaymentEntity>;

export function getReceptionistPaymentDetail(paymentId: number) {
  return http<GetReceptionistPaymentDetailResponse>(`${PAYMENTS_URL}/${paymentId}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}

export type GetReceptionistPaymentDiscountsResponse = Response<ApplicablePaymentDiscount[]>;

export function getReceptionistPaymentDiscounts(paymentId: number) {
  return http<GetReceptionistPaymentDiscountsResponse>(`${PAYMENTS_URL}/${paymentId}/payment-discounts`, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}

export type UpdateReceptionistPaymentPayload = {
  paymentMethod?: 'cash' | 'bank' | 'online';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'cancelled';
  transactionId?: string | null;
  invoiceNumber?: string | null;
  paidAt?: string | null;
  note?: string | null;
  paymentDiscountId?: number | null;
};

export type UpdateReceptionistPaymentResponse = Response<PaymentEntity>;

export function updateReceptionistPayment(paymentId: number, payload: UpdateReceptionistPaymentPayload) {
  return http<UpdateReceptionistPaymentResponse>(`${PAYMENTS_URL}/${paymentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type CompleteReceptionistPaymentPayload = {
  paymentDiscountId?: number | null;
};

export type CompleteReceptionistPaymentResponse = Response<PaymentEntity>;

export function completeReceptionistPayment(paymentId: number, payload: CompleteReceptionistPaymentPayload) {
  return http<CompleteReceptionistPaymentResponse>(`${PAYMENTS_URL}/${paymentId}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}
