import { Select } from 'antd';

import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useGetServiceCategoriesQuery } from '@/modules/admin/features/service-categories/hooks/queries/useGetServiceCategoriesQuery';

const ServiceCategoryParam = () => {
  const categoriesQuery = useGetServiceCategoriesQuery({ page: 1, limit: 100 });

  const options =
    categoriesQuery.data?.data.items.map((c) => ({
      label: c.categoryName,
      value: c.categoryId.toString(),
    })) ?? [];

  return (
    <SelectParamWrapper isNumber param={SEARCH_PARAMS.CATEGORY}>
      <Select
        allowClear
        placeholder="Danh mục"
        options={options}
        loading={categoriesQuery.isFetching}
        style={{ minWidth: 150 }}
        showSearch
        optionFilterProp="label"
      />
    </SelectParamWrapper>
  );
};

export default ServiceCategoryParam;
