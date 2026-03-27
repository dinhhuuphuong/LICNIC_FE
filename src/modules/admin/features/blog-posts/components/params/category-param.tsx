import InfiniteSelect from '@/components/common/selects/infinite-select';
import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { adminServiceCategoriesListQueryKey } from '@/modules/admin/features/service-categories/hooks/queryKeys';
import { type PaginationResponse } from '@/services/http';
import { getServiceCategories, type ServiceCategory } from '@/services/serviceCategoryService';

const CategoryParam = () => {
  return (
    <SelectParamWrapper isNumber param={SEARCH_PARAMS.CATEGORY_ID}>
      <InfiniteSelect<ServiceCategory>
        placeholder="Danh mục"
        style={{ minWidth: 180 }}
        queryKey={[...adminServiceCategoriesListQueryKey, 'infiniteSelect', 'blogPostsCategory']}
        queryFn={(p) =>
          getServiceCategories({
            page: p?.pageIndex ?? 1,
            limit: p?.pageSize ?? 20,
            keyword: p?.keyword,
          })
        }
        getResponse={(res) => (res as PaginationResponse<ServiceCategory>).data.items}
        getTotalRecord={(res) => (res as PaginationResponse<ServiceCategory>).data.total}
        getLabel={(category) => category.categoryName}
        getValue={(category) => category.categoryId}
      />
    </SelectParamWrapper>
  );
};

export default CategoryParam;
