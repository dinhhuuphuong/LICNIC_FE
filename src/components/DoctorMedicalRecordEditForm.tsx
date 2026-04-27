import { PageCard } from '@/components/common/PageCard';
import { Button, Input } from 'antd';

type DoctorMedicalRecordEditFormProps = {
  isVi: boolean;
  editingRecordId: number;
  editingDiagnosis: string;
  editingTreatment: string;
  editingNote: string;
  isUpdatingRecord: boolean;
  onChangeDiagnosis: (value: string) => void;
  onChangeTreatment: (value: string) => void;
  onChangeNote: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function DoctorMedicalRecordEditForm({
  isVi,
  editingRecordId,
  editingDiagnosis,
  editingTreatment,
  editingNote,
  isUpdatingRecord,
  onChangeDiagnosis,
  onChangeTreatment,
  onChangeNote,
  onClose,
  onSubmit,
}: DoctorMedicalRecordEditFormProps) {
  return (
    <PageCard>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            {isVi ? `Chỉnh sửa bệnh án #${editingRecordId}` : `Edit medical record #${editingRecordId}`}
          </h2>
          <Button onClick={onClose} disabled={isUpdatingRecord}>
            {isVi ? 'Đóng' : 'Close'}
          </Button>
        </div>

        <div>
          <label htmlFor="edit-diagnosis" className="mb-2 block text-sm font-semibold text-slate-700">
            {isVi ? 'Chẩn đoán' : 'Diagnosis'}
          </label>
          <Input.TextArea
            id="edit-diagnosis"
            rows={4}
            value={editingDiagnosis}
            onChange={(event) => onChangeDiagnosis(event.target.value)}
            disabled={isUpdatingRecord}
          />
        </div>

        <div>
          <label htmlFor="edit-treatment" className="mb-2 block text-sm font-semibold text-slate-700">
            {isVi ? 'Điều trị' : 'Treatment'}
          </label>
          <Input.TextArea
            id="edit-treatment"
            rows={4}
            value={editingTreatment}
            onChange={(event) => onChangeTreatment(event.target.value)}
            disabled={isUpdatingRecord}
          />
        </div>

        <div>
          <label htmlFor="edit-note" className="mb-2 block text-sm font-semibold text-slate-700">
            {isVi ? 'Ghi chú' : 'Note'}
          </label>
          <Input.TextArea
            id="edit-note"
            rows={3}
            value={editingNote}
            onChange={(event) => onChangeNote(event.target.value)}
            disabled={isUpdatingRecord}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} disabled={isUpdatingRecord}>
            {isVi ? 'Hủy' : 'Cancel'}
          </Button>
          <Button type="primary" onClick={onSubmit} loading={isUpdatingRecord}>
            {isVi ? 'Lưu cập nhật' : 'Save changes'}
          </Button>
        </div>
      </div>
    </PageCard>
  );
}
