import SelectParam from '@/components/common/selects/select-param';
import { SEARCH_PARAMS } from '@/constants/search-params';

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percent', label: 'Phần trăm (%)' },
  { value: 'amount', label: 'Số tiền (VND)' },
];

const DiscountTypeParam = () => {
  return (
    <SelectParam
      allowClear
      className="min-w-[170px]"
      placeholder="Loại ưu đãi"
      param={SEARCH_PARAMS.TYPE}
      options={DISCOUNT_TYPE_OPTIONS}
    />
  );
};

export default DiscountTypeParam;
