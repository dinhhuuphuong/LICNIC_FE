import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  getDoctorWorkSchedules,
  type GetDoctorWorkSchedulesParams,
  type GetDoctorWorkSchedulesResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkSchedulesListQueryKey } from '../queryKeys';

export function useGetDoctorWorkSchedulesQuery(params: GetDoctorWorkSchedulesParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const doctorId = params.doctorId;
  const fromDate = params.fromDate;
  const toDate = params.toDate;

  return useQuery<GetDoctorWorkSchedulesResponse>({
    queryKey: [
      ...adminDoctorWorkSchedulesListQueryKey,
      'api',
      page,
      limit,
      doctorId ?? null,
      fromDate ?? null,
      toDate ?? null,
    ],
    queryFn: () => getDoctorWorkSchedules({ page, limit, doctorId, fromDate, toDate }),
    placeholderData: keepPreviousData,
  });
}
