import { Flex, Typography } from 'antd';
import dayjs from 'dayjs';
import { useQueryParam } from 'use-query-params';
import { useSearchParams } from 'react-router-dom';

import SelectDateModeParam from '@/components/common/date-pickers/select-date-mode-param';
import RangePickerParam from '@/components/common/date-pickers/range-picker-param';
import SelectParamWrapper from '@/components/common/selects/select-param-wrapper';
import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import DoctorWorkSchedulesTable from '../components/DoctorWorkSchedulesTable';
import ModifyDoctorWorkSchedule from '../components/ModifyDoctorWorkSchedule';
import ViewMode from '../components/params/view-mode';
import DoctorInfiniteSelect from '../components/selects/DoctorInfiniteSelect';
import WorkScheduleGrid from '../components/WorkScheduleGrid';

const Manage = () => {
  const [viewMode] = useQueryParam<string>(SEARCH_PARAMS.VIEW_MODE);
  const [searchParams] = useSearchParams();
  const fromDateParam = searchParams.get(SEARCH_PARAMS.FROM_DATE);
  const selectDateDefault = fromDateParam
    ? dayjs(fromDateParam, DATE_FORMAT.DB_DATE)
    : dayjs().startOf('month');

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
          {viewMode === 'grid' ? (
            <SelectDateModeParam defaultValue={selectDateDefault} />
          ) : (
            <RangePickerParam
              allowClear={false}
              format={DATE_FORMAT.DATE}
              dbFormat={DATE_FORMAT.DB_DATE}
              placeholder={['Từ ngày', 'Đến ngày']}
              defaultValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
            />
          )}
          <ModifyDoctorWorkSchedule />

          <ViewMode />
        </Flex>
      </Flex>
      {viewMode === 'grid' ? <WorkScheduleGrid /> : <DoctorWorkSchedulesTable />}
    </Flex>
  );
};

export default Manage;
