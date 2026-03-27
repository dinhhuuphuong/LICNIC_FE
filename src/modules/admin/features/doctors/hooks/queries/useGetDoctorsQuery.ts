import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getDoctors, type GetDoctorsParams, type GetDoctorsResponse } from '@/services/doctorService';

import { adminDoctorsListQueryKey } from '../queryKeys';

export function useGetDoctorsQuery(params: GetDoctorsParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  const keyword = params.keyword;
  const specialization = params.specialization;
  const minExperienceYears = params.minExperienceYears;
  const maxExperienceYears = params.maxExperienceYears;
  const minConsultationFee = params.minConsultationFee;
  const maxConsultationFee = params.maxConsultationFee;
  const userStatus = params.userStatus;

  return useQuery<GetDoctorsResponse>({
    queryKey: [
      ...adminDoctorsListQueryKey,
      page,
      limit,
      keyword ?? null,
      specialization ?? null,
      minExperienceYears ?? null,
      maxExperienceYears ?? null,
      minConsultationFee ?? null,
      maxConsultationFee ?? null,
      userStatus ?? null,
    ],
    queryFn: () =>
      getDoctors({
        page,
        limit,
        keyword,
        specialization,
        minExperienceYears,
        maxExperienceYears,
        minConsultationFee,
        maxConsultationFee,
        userStatus,
      }),
    placeholderData: keepPreviousData,
  });
}
