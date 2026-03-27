import { useQuery } from '@tanstack/react-query';

import {
  getDoctorWorkScheduleDetail,
  type GetDoctorWorkScheduleDetailResponse,
} from '@/services/doctorWorkScheduleService';

import { adminDoctorWorkScheduleDetailQueryKey } from '../queryKeys';

export function useGetDoctorWorkScheduleDetailQuery(scheduleId: number | undefined, enabled: boolean) {
  return useQuery<GetDoctorWorkScheduleDetailResponse>({
    queryKey: [...adminDoctorWorkScheduleDetailQueryKey, scheduleId],
    queryFn: () => {
      if (!scheduleId) throw new Error('Missing scheduleId');
      return getDoctorWorkScheduleDetail(scheduleId);
    },
    enabled: Boolean(scheduleId) && enabled,
  });
}
