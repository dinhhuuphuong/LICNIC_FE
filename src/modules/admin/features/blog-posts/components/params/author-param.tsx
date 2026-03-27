import InfiniteSelect from '@/components/common/selects/infinite-select';
import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { adminUsersListQueryKey } from '@/modules/admin/features/users/hooks/queryKeys';
import { type PaginationResponse } from '@/services/http';
import { getUsers, type User } from '@/services/userService';

const AuthorParam = () => {
  return (
    <SelectParamWrapper isNumber param={SEARCH_PARAMS.AUTHOR_ID}>
      <InfiniteSelect<User>
        placeholder="Tác giả"
        style={{ minWidth: 220 }}
        queryKey={[...adminUsersListQueryKey, 'infiniteSelect', 'blogPostsAuthor']}
        queryFn={(p) =>
          getUsers({
            page: p?.pageIndex ?? 1,
            limit: p?.pageSize ?? 20,
            keyword: p?.keyword,
          })
        }
        getResponse={(res) => (res as PaginationResponse<User>).data.items}
        getTotalRecord={(res) => (res as PaginationResponse<User>).data.total}
        getLabel={(u) => `${u.name ?? `User ${u.userId}`} - ${u.email}`}
        getValue={(u) => u.userId}
      />
    </SelectParamWrapper>
  );
};

export default AuthorParam;
