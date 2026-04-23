import { http, type Response } from '@/services/http';

const CLINIC_INFO_URL = '/clinic-info';

export type ClinicInfo = {
  introduction: string;
  workingHours: string;
  address: string;
};

export type GetClinicInfoResponse = Response<ClinicInfo>;

export function getClinicInfo() {
  return http<GetClinicInfoResponse>(CLINIC_INFO_URL, {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });
}
