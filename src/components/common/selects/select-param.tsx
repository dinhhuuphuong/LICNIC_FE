import { Select, SelectProps } from 'antd';
import { useMemo } from 'react';
import { UrlUpdateType, useQueryParam, useQueryParams } from 'use-query-params';

interface SelectParamProps extends SelectProps {
  param: string;
  updateType?: UrlUpdateType;
  clearParams?: string[];
  /**
   * Cấu hình cách mã hóa mảng vào URL khi mode=multiple/tags
   * 'json' (mặc định) hoặc 'comma'
   */
  arrayEncoding?: 'json' | 'comma';
}

const defaultFilterOption: NonNullable<SelectProps['filterOption']> = (input, option) => {
  const normalizedInput = input.trim().toLowerCase();
  if (!normalizedInput) return true;

  const { label, value } = option ?? {};

  if (typeof label === 'string' || typeof label === 'number') {
    return label.toString().toLowerCase().includes(normalizedInput);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value.toString().toLowerCase().includes(normalizedInput);
  }

  return false;
};

const SelectParam = (props: SelectParamProps) => {
  const {
    param,
    updateType,
    clearParams,
    showSearch,
    filterOption,
    optionFilterProp,
    arrayEncoding = 'json',
    mode,
    ...rest
  } = props;

  // Đọc/ghi raw string param trong URL
  const [raw, setRaw] = useQueryParam<string | undefined>(param);
  const [, setQueryParams] = useQueryParams();

  const isMultiple = mode === 'multiple' || mode === 'tags';

  // Chuyển đổi raw string <-> giá trị cho Select
  const decodeValue = (): string | string[] | undefined => {
    if (!raw) return undefined;
    if (!isMultiple) return raw;

    try {
      if (arrayEncoding === 'json') {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      }
      // comma-separated
      return raw.split(',').filter(Boolean);
    } catch {
      // Nếu parse lỗi, fallback: coi như single -> mảng 1 phần tử
      return [raw];
    }
  };

  const encodeValue = (val: string | string[] | undefined): string | undefined => {
    if (val == null) return undefined;
    if (!isMultiple) return String(val);
    const arr = Array.isArray(val) ? val : [String(val)];
    if (arrayEncoding === 'json') return JSON.stringify(arr);
    return arr.join(',');
  };

  const value = decodeValue();

  const handleChange = (newVal: string | string[]) => {
    // newVal: string (single) hoặc string[] (multiple/tags)
    const encoded = encodeValue(newVal);

    if (clearParams && clearParams.length > 0) {
      const cleared = clearParams.reduce(
        (acc, p) => {
          acc[p] = undefined;
          return acc;
        },
        {} as Record<string, undefined>
      );

      setQueryParams({ ...cleared, [param]: encoded }, updateType);
    } else {
      setRaw(encoded, updateType);
    }
  };

  const resolvedFilterOption = useMemo(() => filterOption ?? defaultFilterOption, [filterOption]);
  const resolvedOptionFilterProp = optionFilterProp ?? 'label';
  const resolvedShowSearch = showSearch ?? true;

  return (
    <Select
      mode={mode}
      value={value}
      onChange={handleChange}
      showSearch={resolvedShowSearch}
      optionFilterProp={resolvedOptionFilterProp}
      filterOption={resolvedFilterOption}
      {...rest}
    />
  );
};

export default SelectParam;
