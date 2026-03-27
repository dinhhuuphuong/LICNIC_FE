import { http, type PaginationResponse, type Response } from '@/services/http';

export type DoctorUser = {
  userId: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  avatar: string | null;
  status: string;
  createdAt: string;
};

export type Doctor = {
  doctorId: number;
  userId: number;
  user: DoctorUser;
  specialization: string;
  experienceYears: number;
  description: string;
  // Backend trả string decimal (vd: "200000.00")
  consultationFee: string;
  createdAt: string;
  deletedAt: string | null;
};

export type GetDoctorsResponse = PaginationResponse<Doctor>;

export type GetDoctorsParams = {
  keyword?: string;
  specialization?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  minConsultationFee?: number;
  maxConsultationFee?: number;
  userStatus?: string;
  limit?: number;
  page?: number;
};

const DOCTORS_URL = '/doctors';

export function getDoctors(params: GetDoctorsParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const queryParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (params.keyword) queryParams.set('keyword', params.keyword);
  if (params.specialization) queryParams.set('specialization', params.specialization);
  if (params.minExperienceYears !== undefined) queryParams.set('minExperienceYears', String(params.minExperienceYears));
  if (params.maxExperienceYears !== undefined) queryParams.set('maxExperienceYears', String(params.maxExperienceYears));
  if (params.minConsultationFee !== undefined) queryParams.set('minConsultationFee', String(params.minConsultationFee));
  if (params.maxConsultationFee !== undefined) queryParams.set('maxConsultationFee', String(params.maxConsultationFee));
  if (params.userStatus) queryParams.set('userStatus', params.userStatus);

  return http<GetDoctorsResponse>(`${DOCTORS_URL}?${queryParams.toString()}`);
}

export type GetDoctorDetailResponse = Response<Doctor>;

export function getDoctorDetail(doctorId: number) {
  return http<GetDoctorDetailResponse>(`${DOCTORS_URL}/${doctorId}`);
}

export type CreateDoctorPayload = {
  userId: number;
  specialization: string;
  experienceYears: number;
  description: string;
  consultationFee: number;
};

export type CreateDoctorResponse = Response<Doctor>;

export function createDoctor(payload: CreateDoctorPayload) {
  return http<CreateDoctorResponse>(DOCTORS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type UpdateDoctorPayload = Partial<Omit<CreateDoctorPayload, 'userId'>>;

export type UpdateDoctorResponse = Response<Doctor>;

export function updateDoctor(doctorId: number, payload: UpdateDoctorPayload) {
  return http<UpdateDoctorResponse>(`${DOCTORS_URL}/${doctorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(payload),
  });
}

export type DeleteDoctorResponse = Response<null>;

export function deleteDoctor(doctorId: number) {
  return http<DeleteDoctorResponse>(`${DOCTORS_URL}/${doctorId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
