import { Flex, Typography } from 'antd';

import RangePickerParam from '@/components/common/date-pickers/range-picker-param';
import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import dayjs from 'dayjs';
import DoctorWorkSchedulesTable from '../components/DoctorWorkSchedulesTable';
import ModifyDoctorWorkSchedule from '../components/ModifyDoctorWorkSchedule';
import DoctorInfiniteSelect from '../components/selects/DoctorInfiniteSelect';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý lịch làm việc
        </Typography.Title>

        <Flex gap={8} wrap>
          <SelectParamWrapper isNumber param={SEARCH_PARAMS.DOCTOR_ID}>
            <DoctorInfiniteSelect placeholder="Bác sĩ" style={{ width: 260 }} />
          </SelectParamWrapper>
          <RangePickerParam
            allowClear={false}
            format={DATE_FORMAT.DATE}
            dbFormat={DATE_FORMAT.DB_DATE}
            placeholder={['Từ ngày', 'Đến ngày']}
            defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
          />
          <ModifyDoctorWorkSchedule />
        </Flex>
      </Flex>
      <DoctorWorkSchedulesTable />
    </Flex>
  );
};

export default Manage;
