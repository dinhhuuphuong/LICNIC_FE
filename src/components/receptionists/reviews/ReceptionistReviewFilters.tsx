import { Button, InputNumber, Select } from 'antd';

type ReceptionistReviewFiltersProps = {
  isVi: boolean;
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
  status?: string;
  onChangePatientId: (value?: number) => void;
  onChangeDoctorId: (value?: number) => void;
  onChangeAppointmentId: (value?: number) => void;
  onChangeStatus: (value?: string) => void;
  onClear: () => void;
};

export function ReceptionistReviewFilters({
  isVi,
  patientId,
  doctorId,
  appointmentId,
  status,
  onChangePatientId,
  onChangeDoctorId,
  onChangeAppointmentId,
  onChangeStatus,
  onClear,
}: ReceptionistReviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <InputNumber
        min={1}
        value={patientId}
        placeholder={isVi ? 'Mã bệnh nhân' : 'Patient ID'}
        className="w-[140px]"
        onChange={(value) => onChangePatientId(typeof value === 'number' ? value : undefined)}
      />
      <InputNumber
        min={1}
        value={doctorId}
        placeholder={isVi ? 'Mã bác sĩ' : 'Doctor ID'}
        className="w-[140px]"
        onChange={(value) => onChangeDoctorId(typeof value === 'number' ? value : undefined)}
      />
      <InputNumber
        min={1}
        value={appointmentId}
        placeholder={isVi ? 'Mã lịch hẹn' : 'Appointment ID'}
        className="w-[150px]"
        onChange={(value) => onChangeAppointmentId(typeof value === 'number' ? value : undefined)}
      />
      <Select
        allowClear
        value={status}
        className="w-[170px]"
        placeholder={isVi ? 'Trạng thái duyệt' : 'Review status'}
        options={[
          { value: 'pending', label: isVi ? 'Chờ duyệt' : 'Pending' },
          { value: 'approved', label: isVi ? 'Đã duyệt' : 'Approved' },
          { value: 'rejected', label: isVi ? 'Từ chối' : 'Rejected' },
        ]}
        onChange={(value) => onChangeStatus(value)}
      />
      <Button onClick={onClear}>{isVi ? 'Xóa lọc' : 'Clear filters'}</Button>
    </div>
  );
}
