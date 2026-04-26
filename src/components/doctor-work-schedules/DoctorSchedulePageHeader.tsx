import SelectDateModeParam from '@/components/common/date-pickers/select-date-mode-param';
import DATE_FORMAT from '@/constants/date-format';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';

type DoctorSchedulePageHeaderProps = {
  isVi: boolean;
  modeTitle: string;
  modeDescription: string;
  fromDate: string;
  onCreateSchedule: () => void;
};

export function DoctorSchedulePageHeader(props: DoctorSchedulePageHeaderProps) {
  const { isVi, modeTitle, modeDescription, fromDate, onCreateSchedule } = props;

  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <h1 className="mb-0 text-2xl font-bold text-slate-900">{modeTitle}</h1>
        <p className="text-sm text-slate-500">{modeDescription}</p>
      </div>
      <div className="flex items-center gap-3">
        <SelectDateModeParam defaultValue={dayjs(fromDate, DATE_FORMAT.DB_DATE)} />
        <Button icon={<Plus />} onClick={onCreateSchedule} type="primary">
          {isVi ? 'Tạo lịch làm việc' : 'Create schedules'}
        </Button>
      </div>
    </header>
  );
}
