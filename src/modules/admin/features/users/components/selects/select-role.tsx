import { Select, SelectProps } from 'antd';

import { useGetRolesQuery } from '../../hooks/queries/useGetRolesQuery';

const SelectRole = (props: SelectProps) => {
  const { value, onChange, disabled, placeholder, ...rest } = props;

  const rolesQuery = useGetRolesQuery({
    page: 1,
    limit: 10,
  });

  return (
    <Select
      {...rest}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      loading={rolesQuery.isLoading}
      options={(rolesQuery.data?.data.items ?? []).map((role) => ({
        value: role.roleId,
        label: role.roleName,
      }))}
      showSearch={{
        optionFilterProp: 'label',
      }}
      allowClear
    />
  );
};

export default SelectRole;
