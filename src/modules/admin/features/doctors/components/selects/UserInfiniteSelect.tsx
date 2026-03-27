import InfiniteSelect from '@/components/common/selects/infinite-select';
import { type PaginationResponse } from '@/services/http';
import { getUsers, type User } from '@/services/userService';

import type { SelectProps } from 'antd';

import { useGetUserDetailQuery } from '@/modules/admin/features/users/hooks/queries/useGetUserDetailQuery';
import { adminUsersListQueryKey } from '@/modules/admin/features/users/hooks/queryKeys';
import { useMemo } from 'react';

type UserInfiniteSelectProps = SelectProps & {
  /** Enable/disable both default query and infinite query */
  enabled?: boolean;
};

export default function UserInfiniteSelect({ enabled = true, ...props }: UserInfiniteSelectProps) {
  const selectedUserId = useMemo(() => {
    const v = props.value ?? props.defaultValue;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    return undefined;
  }, [props.defaultValue, props.value]);

  const userDetailQuery = useGetUserDetailQuery(selectedUserId, enabled);

  const selectedUserOption = useMemo(() => {
    const u = userDetailQuery.data?.data;
    if (!u) return [];
    return [
      {
        label: `${u.name} (${u.email})`,
        value: u.userId,
      },
    ];
  }, [userDetailQuery.data]);

  return (
    <InfiniteSelect<User>
      {...props}
      enabled={enabled}
      queryKey={[...adminUsersListQueryKey, 'infiniteSelect']}
      placeholder={props.placeholder ?? 'Chọn user'}
      defaultItems={selectedUserOption}
      queryFn={(p) =>
        getUsers({
          page: p?.pageIndex ?? 1,
          limit: p?.pageSize ?? 20,
          keyword: p?.keyword,
        })
      }
      getResponse={(res) => (res as PaginationResponse<User>).data.items}
      getTotalRecord={(res) => (res as PaginationResponse<User>).data.total}
      getLabel={(u) => `${u.name} (${u.email})`}
      getValue={(u) => u.userId}
    />
  );
}
