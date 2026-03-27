import { SelectProps } from 'antd';
import React, { isValidElement, ReactElement, useMemo } from 'react';
import { UrlUpdateType, useQueryParam, useQueryParams } from 'use-query-params';

export interface SelectParamWrapperProps extends Omit<SelectProps, 'value' | 'onChange'> {
  param: string;
  updateType?: UrlUpdateType;
  clearParams?: string[];
  isNumber?: boolean;
  /**
   * Cấu hình cách mã hóa mảng vào URL khi mode=multiple/tags
   * 'json' (mặc định) hoặc 'comma'
   */
  arrayEncoding?: 'json' | 'comma';
  children: ReactElement<SelectProps>;
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

const SelectParamWrapper = (props: SelectParamWrapperProps) => {
  const {
    isNumber,
    children,
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

  const [raw, setRaw] = useQueryParam<string | undefined>(param);
  const [, setQueryParams] = useQueryParams();

  const isMultiple = mode === 'multiple' || mode === 'tags';

  const decodeValue = (): string | string[] | undefined => {
    if (!raw) return undefined;
    if (!isMultiple) return raw;

    try {
      if (arrayEncoding === 'json') {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      }
      return raw.split(',').filter(Boolean);
    } catch {
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

  const value = isNumber ? (decodeValue() ? Number(decodeValue()) : undefined) : decodeValue();

  const resolvedFilterOption = useMemo(() => filterOption ?? defaultFilterOption, [filterOption]);
  const resolvedOptionFilterProp = optionFilterProp ?? 'label';
  const resolvedShowSearch = showSearch ?? true;

  if (!isValidElement(children)) return null;

  const childProps = (children.props ?? {}) as Record<string, unknown>;
  const childOnChange = childProps.onChange as ((val: unknown, option?: unknown) => void) | undefined;

  const handleChange = (newVal: unknown, option?: unknown) => {
    const encoded = encodeValue(newVal as string | string[] | undefined);

    if (clearParams && clearParams.length > 0) {
      const cleared = clearParams.reduce(
        (acc, p) => {
          acc[p] = undefined;
          return acc;
        },
        {} as Record<string, undefined>,
      );

      setQueryParams({ ...cleared, [param]: encoded }, updateType);
    } else {
      setRaw(encoded, updateType);
    }

    childOnChange?.(newVal, option);
  };

  return React.cloneElement<SelectProps>(children, {
    ...childProps,
    ...rest,
    mode,
    value,
    onChange: handleChange,
    allowClear: true,
    showSearch: resolvedShowSearch,
    optionFilterProp: resolvedOptionFilterProp,
    filterOption: resolvedFilterOption,
  });
};

export default SelectParamWrapper;
