import { SEARCH_PARAMS } from '@/constants/search-params';
import { InputProps } from 'antd';
import { Search } from 'lucide-react';
import InputParam from './input-param';

const InputSearchParam = (props: InputProps) => {
  return (
    <InputParam
      allowClear
      param={SEARCH_PARAMS.KEYWORD}
      suffix={<Search size={16} />}
      placeholder="Tìm kiếm..."
      {...props}
    />
  );
};

export default InputSearchParam;
