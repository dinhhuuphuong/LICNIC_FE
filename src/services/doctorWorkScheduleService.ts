import { http, type PaginationResponse, type Response } from '@/services/http';

import type { Doctor } from '@/services/doctorService';

export type DoctorWorkScheduleStatus = 'pending' | 'approved' | 'rejected';

export type DoctorWorkSchedule = {
  scheduleId: number;
  doctorId: number;
  doctor?: Doctor;
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  status: DoctorWorkScheduleStatus;
  maxPatients: number;
  slotDurationMinutes: number;
  createdAt: string;
  deletedAt?: string | null;
};

export type GetDoctorWorkSchedulesParams = {
  page?: number;
  limit?: number;
  doctorId?: number;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
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
