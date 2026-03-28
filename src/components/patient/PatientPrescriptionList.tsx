import type { Prescription } from '@/services/prescriptionService';

type PatientPrescriptionListProps = {
  items: Prescription[];
  isVi: boolean;
};

export function PatientPrescriptionList({ items, isVi }: PatientPrescriptionListProps) {
  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        {isVi ? 'Không có thuốc kê trong đợt khám này.' : 'No medicines were prescribed for this visit.'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[320px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-emerald-50/80">
            <th scope="col" className="px-4 py-3 font-bold text-slate-800">
              {isVi ? 'Thuốc' : 'Medicine'}
            </th>
            <th scope="col" className="px-4 py-3 font-bold text-slate-800">
              {isVi ? 'Liều dùng' : 'Dosage'}
            </th>
            <th scope="col" className="px-4 py-3 font-bold text-slate-800">
              {isVi ? 'Hướng dẫn' : 'Instructions'}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.prescriptionId} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 align-top font-semibold text-slate-900">{row.medicineName}</td>
              <td className="px-4 py-3 align-top text-slate-700">{row.dosage}</td>
              <td className="px-4 py-3 align-top text-slate-700">{row.instruction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
