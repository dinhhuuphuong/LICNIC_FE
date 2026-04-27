import SelectDateModeParam from '@/components/common/date-pickers/select-date-mode-param';
import SelectParam from '@/components/common/selects/select-param';
import { SEARCH_PARAMS } from '@/constants/search-params';
import dayjs from 'dayjs';

const DOCTOR_APPOINTMENT_STATUS_OPTIONS = [
  { value: 'pending', labelVi: 'Chờ xác nhận', labelEn: 'Pending' },
  { value: 'confirmed', labelVi: 'Đã xác nhận', labelEn: 'Confirmed' },
  { value: 'checked_in', labelVi: 'Đã check-in', labelEn: 'Checked in' },
  { value: 'completed', labelVi: 'Đã khám xong', labelEn: 'Completed' },
  { value: 'cancelled', labelVi: 'Đã hủy', labelEn: 'Cancelled' },
];

type DoctorAppointmentFiltersProps = {
  isVi: boolean;
};

export function DoctorAppointmentFilters({ isVi }: DoctorAppointmentFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <SelectDateModeParam defaultValue={dayjs().startOf('month')} />
      <SelectParam
        allowClear
        className="w-[170px]"
        placeholder={isVi ? 'Trạng thái' : 'Status'}
        param={SEARCH_PARAMS.STATUS}
        options={DOCTOR_APPOINTMENT_STATUS_OPTIONS.map((option) => ({
          value: option.value,
          label: isVi ? option.labelVi : option.labelEn,
        }))}
      />
    </div>
  );
}
