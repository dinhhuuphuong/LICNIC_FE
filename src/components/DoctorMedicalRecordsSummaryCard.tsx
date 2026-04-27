import { PageCard } from '@/components/common/PageCard';

type DoctorMedicalRecordsSummaryCardProps = {
  isVi: boolean;
  total: number;
  onCreateRecord: () => void;
};

export function DoctorMedicalRecordsSummaryCard({ isVi, total, onCreateRecord }: DoctorMedicalRecordsSummaryCardProps) {
  return (
    <PageCard>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          {isVi ? 'Tổng bệnh án' : 'Total records'}: <strong className="text-slate-900">{total}</strong>
        </span>
        {!total && (
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-blue-600 bg-white px-5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            onClick={onCreateRecord}
          >
            {isVi ? 'Tạo hồ sơ bệnh án' : 'Create medical record'}
          </button>
        )}
      </div>
    </PageCard>
  );
}
