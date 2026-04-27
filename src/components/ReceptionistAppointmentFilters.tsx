import SelectDateModeParam from '@/components/common/date-pickers/select-date-mode-param';
import SelectParam from '@/components/common/selects/select-param';
import { SEARCH_PARAMS } from '@/constants/search-params';
import dayjs from 'dayjs';

const RECEPTIONIST_APPOINTMENT_STATUS_OPTIONS = [
  { value: 'pending', labelVi: 'Chờ xác nhận', labelEn: 'Pending' },
  { value: 'confirmed', labelVi: 'Đã xác nhận', labelEn: 'Confirmed' },
  { value: 'completed', labelVi: 'Đã khám xong', labelEn: 'Completed' },
  { value: 'cancelled', labelVi: 'Đã hủy', labelEn: 'Cancelled' },
  { value: 'checked_in', labelVi: 'Đã check-in', labelEn: 'Checked in' },
];

type ReceptionistAppointmentFiltersProps = {
  isVi: boolean;
};

export function ReceptionistAppointmentFilters({ isVi }: ReceptionistAppointmentFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <SelectDateModeParam defaultValue={dayjs()} />
      <SelectParam
        allowClear
        className="w-[150px]"
        placeholder={isVi ? 'Trạng thái' : 'Status'}
        param={SEARCH_PARAMS.STATUS}
        options={RECEPTIONIST_APPOINTMENT_STATUS_OPTIONS.map((option) => ({
          value: option.value,
          label: isVi ? option.labelVi : option.labelEn,
        }))}
      />
    </div>
  );
}
