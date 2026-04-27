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
  doctorId?: number;
  serviceId?: number;
  scheduleId?: number;
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

export type StaffCancelAppointmentPayload = {
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
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params.status) queryParams.set('status', params.status);
  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);
  if (params.patientId) queryParams.set('patientId', String(params.patientId));
  if (params.doctorId) queryParams.set('doctorId', String(params.doctorId));
  if (params.serviceId) queryParams.set('serviceId', String(params.serviceId));
  if (params.scheduleId) queryParams.set('scheduleId', String(params.scheduleId));

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

export type ConfirmAppointmentResponse = Response<AppointmentEntity>;

export function confirmAppointment(appointmentId: number) {
  return http<ConfirmAppointmentResponse>(`${APPOINTMENTS_URL}/${appointmentId}/confirm`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
    },
  });
}

export type CheckInAppointmentResponse = Response<AppointmentEntity>;

export function checkInAppointment(appointmentId: number) {
  return http<CheckInAppointmentResponse>(`${APPOINTMENTS_URL}/${appointmentId}/check-in`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
    },
  });
}

export type CompleteAppointmentResponse = Response<AppointmentEntity>;

export function completeAppointment(appointmentId: number) {
  return http<CompleteAppointmentResponse>(`${APPOINTMENTS_URL}/${appointmentId}/complete`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
    },
  });
}

export type StaffCancelAppointmentResponse = Response<AppointmentEntity>;

export function cancelAppointmentByStaff(appointmentId: number, payload: StaffCancelAppointmentPayload = {}) {
  return http<StaffCancelAppointmentResponse>(`${APPOINTMENTS_URL}/${appointmentId}/cancel-by-staff`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(Object.keys(payload).length ? payload : {}),
  });
}
