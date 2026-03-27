import InfiniteSelect from '@/components/common/selects/infinite-select';
import { getDoctors, type Doctor } from '@/services/doctorService';
import type { PaginationResponse } from '@/services/http';

import type { SelectProps } from 'antd';
import { useMemo } from 'react';

import { useGetDoctorDetailQuery } from '@/modules/admin/features/doctors/hooks/queries/useGetDoctorDetailQuery';
import { adminDoctorsListQueryKey } from '@/modules/admin/features/doctors/hooks/queryKeys';

type DoctorInfiniteSelectProps = SelectProps & {
  enabled?: boolean;
};

export default function DoctorInfiniteSelect({ enabled = true, ...props }: DoctorInfiniteSelectProps) {
  const selectedDoctorId = useMemo(() => {
    const v = props.value ?? props.defaultValue;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    return undefined;
  }, [props.defaultValue, props.value]);

  const doctorDetailQuery = useGetDoctorDetailQuery(selectedDoctorId, enabled);

  const selectedDoctorOption = useMemo(() => {
    const d = doctorDetailQuery.data?.data;
    if (!d) return [];
    const name = d.user?.name ?? `Doctor ${d.doctorId}`;
    const email = d.user?.email ? ` (${d.user.email})` : '';
    return [
      {
        label: `${name}${email}`,
        value: d.doctorId,
      },
    ];
  }, [doctorDetailQuery.data]);

  return (
    <InfiniteSelect<Doctor>
      {...props}
      enabled={enabled}
      queryKey={[...adminDoctorsListQueryKey, 'infiniteSelect']}
      placeholder={props.placeholder ?? 'Chọn bác sĩ'}
      defaultItems={selectedDoctorOption}
      queryFn={(p) =>
        getDoctors({
          page: p?.pageIndex ?? 1,
          limit: p?.pageSize ?? 20,
          keyword: p?.keyword,
        })
      }
      getResponse={(res) => (res as PaginationResponse<Doctor>).data.items}
      getTotalRecord={(res) => (res as PaginationResponse<Doctor>).data.total}
      getLabel={(d) => `${d.user?.name ?? `Doctor ${d.doctorId}`}${d.user?.email ? ` (${d.user.email})` : ''}`}
      getValue={(d) => d.doctorId}
    />
  );
}
