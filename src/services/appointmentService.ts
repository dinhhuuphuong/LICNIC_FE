import { http, type PaginationResponse, type Response } from '@/services/http';

export type AppointmentEntity = {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  note?: string | null;
  scheduleId?: number | null;
  createdAt: string;
  updatedAt: string;
};

/** Dòng danh sách từ GET /appointments (AppointmentDto). */
export type AppointmentListItem = {
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientMedicalHistory: string;
  doctorId: string;
  doctorName: string;
  serviceId: number;
  serviceName: string;
  serviceCost: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  note: string;
  createdAt: string;
  checkedInAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  updatedAt: string | null;
};

export type GetAppointmentsParams = {
  patientId?: number;
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
};

export type GetAppointmentsResponse = PaginationResponse<AppointmentListItem>;

export type UpdateAppointmentPayload = {
  doctorId?: number;
  serviceId?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  scheduleId?: number;
  note?: string;
};

export type CancelAppointmentPayload = {
  reason?: string;
};

export type CreateAppointmentPayload = {
  doctorId: number;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
  scheduleId?: number;
  note?: string;
};

export type CreateAppointmentResponse = Response<AppointmentEntity>;

const APPOINTMENTS_URL = '/appointments';

export function createAppointment(payload: CreateAppointmentPayload) {
  return http<CreateAppointmentResponse>(APPOINTMENTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export function getAppointments(params: GetAppointmentsParams = {}) {
  const patientId = params.patientId;
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params.status) queryParams.set('status', params.status);
  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);
  if (patientId) queryParams.set('patientId', String(patientId));

  return http<GetAppointmentsResponse>(`${APPOINTMENTS_URL}?${queryParams.toString()}`);
}

export type UpdateAppointmentResponse = Response<AppointmentEntity>;

export function updateAppointment(appointmentId: number, payload: UpdateAppointmentPayload) {
  return http<UpdateAppointmentResponse>(`${APPOINTMENTS_URL}/${appointmentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type CancelAppointmentResponse = Response<AppointmentEntity>;

export function cancelAppointment(appointmentId: number, payload: CancelAppointmentPayload = {}) {
  return http<CancelAppointmentResponse>(`${APPOINTMENTS_URL}/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(Object.keys(payload).length ? payload : {}),
  });
}
