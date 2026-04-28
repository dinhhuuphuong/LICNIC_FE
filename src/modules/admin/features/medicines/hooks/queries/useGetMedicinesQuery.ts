import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMedicines, type GetMedicinesParams, type GetMedicinesResponse } from '@/services/medicineService';

import { adminMedicinesListQueryKey } from '../queryKeys';

export function useGetMedicinesQuery(params: GetMedicinesParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const keyword = params.keyword;

  return useQuery<GetMedicinesResponse>({
    queryKey: [...adminMedicinesListQueryKey, page, limit, keyword ?? null],
    queryFn: () => getMedicines({ page, limit, keyword }),
    placeholderData: keepPreviousData,
  });
}
