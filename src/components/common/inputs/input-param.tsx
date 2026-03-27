import { DEBOUNCE_TIME } from '@/constants/common';
import useDebounce from '@/hooks/useDebounce';
import { Input, InputProps } from 'antd';
import { useEffect, useState } from 'react';
import { UrlUpdateType, useQueryParam } from 'use-query-params';

interface InputParamProps extends InputProps {
  /** Tên param trong url */
  param: string;
  updateType?: UrlUpdateType;
}

const InputParam = (props: InputParamProps) => {
  const { param, updateType, ...rest } = props;

  const [valueParam, setValueParam] = useQueryParam<string | undefined>(param);
  const [value, setValue] = useState(valueParam || '');
  const valueDebounce = useDebounce(value, DEBOUNCE_TIME);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // Đồng bộ state với valueParam khi URL thay đổi (ví dụ: reload trang)
  useEffect(() => {
    setValue(valueParam || '');
  }, [valueParam]);

  // Cập nhật URL param khi user thay đổi input
  useEffect(() => {
    if (valueDebounce !== valueParam) {
      setValueParam(valueDebounce || undefined, updateType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueDebounce, setValueParam, updateType]);

  return <Input value={value} {...rest} onChange={handleChange} />;
};

export default InputParam;
