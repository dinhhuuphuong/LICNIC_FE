import { http, type Response } from '@/services/http';

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
