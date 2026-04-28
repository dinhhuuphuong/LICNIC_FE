import { http, type PaginationResponse, type Response } from '@/services/http';

export type ReviewUser = {
  userId: number;
  name: string;
  avatar: string | null;
};

export type AppointmentReviewItem = {
  reviewId: number;
  patientId: number;
  doctorId: number;
  rating: number;
  comment: string | null;
  appointmentId: number;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    user: ReviewUser;
  };
  doctor: {
    user: ReviewUser;
  };
};

export type GetPatientAppointmentReviewsResponse = Response<AppointmentReviewItem[]>;
export type DeleteReviewResponse = Response<null>;
export type CreateReviewPayload = {
  appointmentId: number;
  rating: number;
  comment: string;
};
export type CreateReviewResponse = Response<AppointmentReviewItem>;
export type UpdateReviewPayload = {
  rating: number;
  comment: string;
};
export type UpdateReviewResponse = Response<AppointmentReviewItem>;
export type RejectReviewPayload = {
  reason: string;
};
export type GetReceptionistReviewsParams = {
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
};
export type GetReceptionistReviewsResponse = PaginationResponse<AppointmentReviewItem>;
export type ReviewDetail = AppointmentReviewItem & {
  appointment: {
    appointmentId: number;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    note: string | null;
  } | null;
};
export type GetReviewDetailResponse = Response<ReviewDetail>;

export function getPatientAppointmentReviews(appointmentId: number) {
  return http<GetPatientAppointmentReviewsResponse>(`/reviews/patient/appointments/${appointmentId}`);
}

export function createReview(payload: CreateReviewPayload) {
  return http<CreateReviewResponse>('/reviews', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function updateReview(reviewId: number, payload: UpdateReviewPayload) {
  return http<UpdateReviewResponse>(`/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteReview(reviewId: number) {
  return http<DeleteReviewResponse>(`/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}

export function getReceptionistReviews(params: GetReceptionistReviewsParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params.patientId) queryParams.set('patientId', String(params.patientId));
  if (params.doctorId) queryParams.set('doctorId', String(params.doctorId));
  if (params.appointmentId) queryParams.set('appointmentId', String(params.appointmentId));
  if (params.status) queryParams.set('status', params.status);

  return http<GetReceptionistReviewsResponse>(`/reviews?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}

export function approveReview(reviewId: number) {
  return http<Response<AppointmentReviewItem>>(`/reviews/${reviewId}/approve`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
    },
  });
}

export function rejectReview(reviewId: number, payload: RejectReviewPayload) {
  return http<Response<AppointmentReviewItem>>(`/reviews/${reviewId}/reject`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function getReviewDetail(reviewId: number) {
  return http<GetReviewDetailResponse>(`/reviews/${reviewId}`, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}
