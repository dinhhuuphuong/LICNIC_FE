import { http, type PaginationResponse, type Response } from '@/services/http';

import type { Doctor } from '@/services/doctorService';

export type DoctorWorkScheduleStatus = 'pending' | 'approved' | 'rejected';

export type DoctorWorkScheduleAppointmentSlotStatus = 'Available' | 'Unavailable';

export type DoctorWorkSchedule = {
  scheduleId: number;
  doctorId: number;
  createdByRoleId?: number;
  doctor?: Doctor;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  status: DoctorWorkScheduleStatus;
  /** Một số API (vd. get-list store) có thể không trả hai field này. */
  maxPatients?: number;
  slotDurationMinutes?: number;
  /**
   * GET get-list + atTime: giao [atTime, atTime+slotDuration) với lịch hẹn cùng BS/ngày → Unavailable.
   * Không có atTime thì thường là null/undefined.
   */
  appointmentStatus?: DoctorWorkScheduleAppointmentSlotStatus | null;
  rejectionReason?: string | null;
  createdAt: string;
  deletedAt?: string | null;
};

export type GetDoctorWorkSchedulesParams = {
  page?: number;
  limit?: number;
  doctorId?: number;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  /** Lọc bác sĩ có đăng ký dịch vụ (GET get-list store) */
  serviceId?: number;
  /** Get-list store: chỉ ca có start ≤ atTime < end; appointmentStatus theo trùng slot với appointments */
  atTime?: string;
  /** Cùng timeTo: lọc ca giao khoảng [timeFrom, timeTo) theo giờ ca */
  timeFrom?: string;
  timeTo?: string;
};

export type GetDoctorWorkSchedulesResponse = PaginationResponse<DoctorWorkSchedule>;

const DOCTOR_WORK_SCHEDULES_URL = '/doctor-work-schedules';

export function getDoctorWorkSchedules(params: GetDoctorWorkSchedulesParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (params.doctorId !== undefined) queryParams.set('doctorId', String(params.doctorId));
  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetDoctorWorkSchedulesResponse>(`${DOCTOR_WORK_SCHEDULES_URL}?${queryParams.toString()}`);
}

export type GetDoctorWorkSchedulesFromStoreResponse = PaginationResponse<DoctorWorkSchedule>;

export function getDoctorWorkSchedulesFromStore(params: GetDoctorWorkSchedulesParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (params.doctorId !== undefined) queryParams.set('doctorId', String(params.doctorId));
  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);
  if (params.serviceId !== undefined) queryParams.set('serviceId', String(params.serviceId));
  if (params.atTime) queryParams.set('atTime', params.atTime);
  if (params.timeFrom) queryParams.set('timeFrom', params.timeFrom);
  if (params.timeTo) queryParams.set('timeTo', params.timeTo);

  return http<GetDoctorWorkSchedulesFromStoreResponse>(
    `${DOCTOR_WORK_SCHEDULES_URL}/get-list?${queryParams.toString()}`,
  );
}

export type GetDoctorWorkScheduleDetailResponse = Response<DoctorWorkSchedule>;

export function getDoctorWorkScheduleDetail(scheduleId: number) {
  return http<GetDoctorWorkScheduleDetailResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/${scheduleId}`);
}

export type CreateDoctorWorkSchedulePayload = {
  doctorId: number;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  maxPatients: number;
  slotDurationMinutes: number;
};

export type CreateDoctorWorkScheduleResponse = Response<DoctorWorkSchedule>;

export function createDoctorWorkSchedule(payload: CreateDoctorWorkSchedulePayload) {
  return http<CreateDoctorWorkScheduleResponse>(DOCTOR_WORK_SCHEDULES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type CreateMyDoctorWorkScheduleBatchItemPayload = {
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxPatients: number;
  slotDurationMinutes: number;
};

export type CreateMyDoctorWorkScheduleBatchPayload = {
  items: CreateMyDoctorWorkScheduleBatchItemPayload[];
};

export type CreateMyDoctorWorkScheduleBatchResponse = Response<DoctorWorkSchedule[]>;

export function createMyDoctorWorkSchedulesBatch(payload: CreateMyDoctorWorkScheduleBatchPayload) {
  return http<CreateMyDoctorWorkScheduleBatchResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/me/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateDoctorWorkSchedulePayload = Partial<CreateDoctorWorkSchedulePayload>;

export type UpdateDoctorWorkScheduleResponse = Response<DoctorWorkSchedule>;

export function updateDoctorWorkSchedule(scheduleId: number, payload: UpdateDoctorWorkSchedulePayload) {
  return http<UpdateDoctorWorkScheduleResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/${scheduleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeleteDoctorWorkScheduleResponse = Response<null>;

export function deleteDoctorWorkSchedule(scheduleId: number) {
  return http<DeleteDoctorWorkScheduleResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/${scheduleId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}

export type ApproveDoctorWorkScheduleResponse = Response<DoctorWorkSchedule>;

export function approveDoctorWorkSchedule(scheduleId: number) {
  return http<ApproveDoctorWorkScheduleResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/${scheduleId}/approve`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
    },
  });
}

export function approveDoctorWorkScheduleByAdmin(scheduleId: number) {
  return http<ApproveDoctorWorkScheduleResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/admin/${scheduleId}/approve`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
    },
  });
}

export type RejectDoctorWorkSchedulePayload = {
  reason: string;
};

export type RejectDoctorWorkScheduleResponse = Response<DoctorWorkSchedule>;

export function rejectDoctorWorkSchedule(scheduleId: number, payload: RejectDoctorWorkSchedulePayload) {
  return http<RejectDoctorWorkScheduleResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/${scheduleId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export function rejectDoctorWorkScheduleByAdmin(scheduleId: number, payload: RejectDoctorWorkSchedulePayload) {
  return http<RejectDoctorWorkScheduleResponse>(`${DOCTOR_WORK_SCHEDULES_URL}/admin/${scheduleId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}
