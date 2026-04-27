import { PageCard } from '@/components/common/PageCard';

type DoctorAppointmentSummaryCardProps = {
  isVi: boolean;
  doctorName: string;
  total: number;
};

export function DoctorAppointmentSummaryCard({ isVi, doctorName, total }: DoctorAppointmentSummaryCardProps) {
  return (
    <PageCard>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          {isVi ? 'Bác sĩ' : 'Doctor'}: <strong className="text-slate-900">{doctorName}</strong>
        </span>
        <span>
          {isVi ? 'Tổng lịch hẹn' : 'Total appointments'}: <strong className="text-slate-900">{total}</strong>
        </span>
      </div>
    </PageCard>
  );
}
