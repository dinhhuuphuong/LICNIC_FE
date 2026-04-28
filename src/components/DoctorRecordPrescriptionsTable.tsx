import type { AppointmentStatus } from '@/components/AppointmentStatusBadge';
import { DeletePrescriptionButton } from '@/components/DeletePrescriptionButton';
import { getMedicines, type Medicine } from '@/services/medicineService';
import {
  createPrescription,
  deletePrescription,
  getPrescriptionDetail,
  listPrescriptionsByRecord,
  updatePrescription,
} from '@/services/prescriptionService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Input, InputNumber, Select, Space } from 'antd';
import { Edit, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type DoctorRecordPrescriptionsTableProps = {
  appointmentStatus: AppointmentStatus;
  recordId: number;
  isVi: boolean;
  createRequestKey?: number;
};

export function DoctorRecordPrescriptionsTable({
  appointmentStatus,
  recordId,
  isVi,
  createRequestKey,
}: DoctorRecordPrescriptionsTableProps) {
  const queryClient = useQueryClient();
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<number | null>(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingDosage, setEditingDosage] = useState('');
  const [editingInstruction, setEditingInstruction] = useState('');
  const [editingNote, setEditingNote] = useState('');
  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(null);
  const [newMedicineId, setNewMedicineId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isCreatingPrescription, setIsCreatingPrescription] = useState(false);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null);

  const canUpdatePrescription = appointmentStatus === 'checked_in';
  const canDeletePrescription = appointmentStatus === 'checked_in';

  const medicinesQuery = useQuery({
    queryKey: ['doctorMedicinesForPrescriptionSelect'],
    queryFn: () => getMedicines({ page: 1, limit: 200 }),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ['doctorRecordPrescriptions', recordId],
    queryFn: () =>
      listPrescriptionsByRecord({
        recordId,
        page: 1,
        limit: 20,
      }),
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: (payload: { prescriptionId: number }) => {
      const medicineId = editingMedicineId;
      if (!medicineId) {
        throw new Error(
          isVi ? 'Thiếu medicineId để cập nhật đơn thuốc.' : 'Missing medicineId to update prescription.',
        );
      }
      return updatePrescription(payload.prescriptionId, {
        recordId,
        medicineId,
        quantity: Number(editingQuantity),
        price: Number(editingPrice),
        note: editingNote.trim() || undefined,
        dosage: editingDosage.trim(),
        instruction: editingInstruction.trim(),
      });
    },
    onSuccess: async () => {
      setUpdateSuccessMessage(isVi ? 'Cập nhật đơn thuốc thành công.' : 'Prescription updated successfully.');
      setEditingPrescriptionId(null);
      setEditingMedicineId(null);
      await queryClient.invalidateQueries({
        queryKey: ['doctorRecordPrescriptions', recordId],
      });
    },
    onError: (error) => {
      setUpdateErrorMessage(
        error instanceof Error
          ? error.message
          : isVi
            ? 'Cập nhật đơn thuốc thất bại.'
            : 'Failed to update prescription.',
      );
    },
  });
  const createPrescriptionMutation = useMutation({
    mutationFn: () => {
      const medicineId = Number(newMedicineId);
      const quantity = Number(newQuantity);
      const price = Number(newPrice);
      const dosage = newDosage.trim();
      const instruction = newInstruction.trim();
      const note = newNote.trim();

      if (!Number.isInteger(medicineId) || medicineId <= 0) {
        throw new Error(isVi ? 'Vui lòng chọn thuốc.' : 'Please select a medicine.');
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(isVi ? 'Số lượng phải lớn hơn 0.' : 'Quantity must be greater than 0.');
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(isVi ? 'Giá không hợp lệ.' : 'Invalid price.');
      }
      if (!dosage || !instruction) {
        throw new Error(isVi ? 'Liều dùng và hướng dẫn là bắt buộc.' : 'Dosage and instruction are required.');
      }

      return createPrescription({
        recordId,
        medicineId,
        quantity,
        price,
        dosage,
        instruction,
        note: note || undefined,
      });
    },
    onSuccess: async () => {
      setUpdateErrorMessage(null);
      setUpdateSuccessMessage(isVi ? 'Thêm đơn thuốc thành công.' : 'Prescription added successfully.');
      setNewMedicineId('');
      setNewQuantity('');
      setNewPrice('');
      setNewDosage('');
      setNewInstruction('');
      setNewNote('');
      setIsCreatingPrescription(false);
      await queryClient.invalidateQueries({
        queryKey: ['doctorRecordPrescriptions', recordId],
      });
    },
    onError: (error) => {
      setUpdateErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Thêm đơn thuốc thất bại.' : 'Failed to add prescription.',
      );
    },
  });
  const deletePrescriptionMutation = useMutation({
    mutationFn: (prescriptionId: number) => deletePrescription(prescriptionId),
    onSuccess: async () => {
      setUpdateErrorMessage(null);
      setUpdateSuccessMessage(isVi ? 'Xóa đơn thuốc thành công.' : 'Prescription deleted successfully.');
      setEditingPrescriptionId(null);
      setEditingMedicineId(null);
      await queryClient.invalidateQueries({
        queryKey: ['doctorRecordPrescriptions', recordId],
      });
    },
    onError: (error) => {
      setUpdateErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Xóa đơn thuốc thất bại.' : 'Failed to delete prescription.',
      );
    },
  });

  const startEditPrescription = async (prescriptionId: number) => {
    setIsCreatingPrescription(false);
    setUpdateErrorMessage(null);
    setUpdateSuccessMessage(null);
    try {
      const response = await getPrescriptionDetail(prescriptionId);
      const detail = response.data;
      setEditingPrescriptionId(detail.prescriptionId);
      setEditingMedicineId(detail.medicineId);
      setEditingQuantity(String(detail.quantity));
      setEditingPrice(String(detail.price));
      setEditingDosage(detail.dosage ?? '');
      setEditingInstruction(detail.instruction ?? '');
      setEditingNote(detail.note ?? '');
    } catch (error) {
      setUpdateErrorMessage(
        error instanceof Error
          ? error.message
          : isVi
            ? 'Không tải được chi tiết đơn thuốc.'
            : 'Cannot load prescription detail.',
      );
    }
  };

  const cancelEdit = () => {
    setEditingPrescriptionId(null);
    setEditingMedicineId(null);
    setUpdateErrorMessage(null);
    setUpdateSuccessMessage(null);
  };

  const submitEditPrescription = () => {
    if (!editingPrescriptionId) return;
    setUpdateErrorMessage(null);
    setUpdateSuccessMessage(null);

    const quantity = Number(editingQuantity);
    const price = Number(editingPrice);
    const dosage = editingDosage.trim();
    const instruction = editingInstruction.trim();

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setUpdateErrorMessage(isVi ? 'Số lượng phải lớn hơn 0.' : 'Quantity must be greater than 0.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setUpdateErrorMessage(isVi ? 'Giá không hợp lệ.' : 'Invalid price.');
      return;
    }
    if (!dosage || !instruction) {
      setUpdateErrorMessage(isVi ? 'Liều dùng và hướng dẫn là bắt buộc.' : 'Dosage and instruction are required.');
      return;
    }

    updatePrescriptionMutation.mutate({ prescriptionId: editingPrescriptionId });
  };

  const startCreatePrescription = () => {
    setEditingPrescriptionId(null);
    setEditingMedicineId(null);
    setUpdateErrorMessage(null);
    setUpdateSuccessMessage(null);
    setNewMedicineId('');
    setNewQuantity('');
    setNewPrice('');
    setNewDosage('');
    setNewInstruction('');
    setNewNote('');
    setIsCreatingPrescription(true);
  };

  const cancelCreatePrescription = () => {
    setNewMedicineId('');
    setNewQuantity('');
    setNewPrice('');
    setNewDosage('');
    setNewInstruction('');
    setNewNote('');
    setUpdateErrorMessage(null);
    setUpdateSuccessMessage(null);
    setIsCreatingPrescription(false);
  };

  const medicines: Medicine[] = medicinesQuery.data?.data.items ?? [];

  useEffect(() => {
    if (createRequestKey == null) return;
    startCreatePrescription();
  }, [createRequestKey]);

  if (prescriptionsQuery.isLoading) {
    return <div className="h-24 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (prescriptionsQuery.isError) {
    return (
      <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {prescriptionsQuery.error instanceof Error
          ? prescriptionsQuery.error.message
          : isVi
            ? 'Không tải được danh sách đơn thuốc.'
            : 'Could not load prescriptions.'}
      </p>
    );
  }

  const items = prescriptionsQuery.data?.data.items ?? [];

  return (
    <div className="space-y-3">
      {updateErrorMessage ? <Alert type="error" showIcon message={updateErrorMessage} /> : null}
      {updateSuccessMessage ? <Alert type="success" showIcon message={updateSuccessMessage} /> : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-emerald-50/80">
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'Thuốc' : 'Medicine'}</th>
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'SL' : 'Qty'}</th>
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'Giá' : 'Price'}</th>
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'Liều dùng' : 'Dosage'}</th>
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'Hướng dẫn' : 'Instruction'}</th>
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'Ghi chú' : 'Note'}</th>
              <th className="px-3 py-2 font-bold text-slate-800">{isVi ? 'Thao tác' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {isCreatingPrescription ? (
              <tr className="border-b border-slate-100 bg-amber-50/30">
                <td className="px-3 py-2">
                  <Select
                    placeholder={isVi ? 'Chọn thuốc' : 'Select medicine'}
                    value={newMedicineId || undefined}
                    onChange={(value) => {
                      const selectedId = String(value);
                      setNewMedicineId(selectedId);
                      const selectedMedicine = medicines.find((medicine) => medicine.medicineId === Number(selectedId));
                      if (selectedMedicine?.price != null) {
                        setNewPrice(String(selectedMedicine.price));
                      }
                    }}
                    options={medicines.map((medicine) => ({
                      value: String(medicine.medicineId),
                      label: medicine.medicineName,
                    }))}
                    disabled={createPrescriptionMutation.isPending || medicinesQuery.isLoading}
                    showSearch
                    optionFilterProp="label"
                    className="w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <InputNumber
                    min={1}
                    placeholder={isVi ? 'Số lượng' : 'Quantity'}
                    value={newQuantity ? Number(newQuantity) : undefined}
                    onChange={(value) => setNewQuantity(value == null ? '' : String(value))}
                    disabled={createPrescriptionMutation.isPending}
                    className="w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <InputNumber
                    min={0}
                    placeholder={isVi ? 'Giá' : 'Price'}
                    value={newPrice ? Number(newPrice) : undefined}
                    onChange={(value) => setNewPrice(value == null ? '' : String(value))}
                    disabled
                    className="w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    placeholder={isVi ? 'Liều dùng' : 'Dosage'}
                    value={newDosage}
                    onChange={(event) => setNewDosage(event.target.value)}
                    disabled={createPrescriptionMutation.isPending}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    placeholder={isVi ? 'Hướng dẫn' : 'Instruction'}
                    value={newInstruction}
                    onChange={(event) => setNewInstruction(event.target.value)}
                    disabled={createPrescriptionMutation.isPending}
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    placeholder={isVi ? 'Ghi chú (không bắt buộc)' : 'Note (optional)'}
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    disabled={createPrescriptionMutation.isPending}
                  />
                </td>
                <td className="px-3 py-2">
                  <Space>
                    <Button
                      variant="text"
                      color="danger"
                      icon={<X size={16} />}
                      onClick={cancelCreatePrescription}
                      disabled={createPrescriptionMutation.isPending}
                    />
                    <Button
                      variant="text"
                      color="primary"
                      icon={<Save size={16} />}
                      loading={createPrescriptionMutation.isPending}
                      onClick={() => createPrescriptionMutation.mutate()}
                      disabled={medicinesQuery.isLoading}
                    />
                  </Space>
                </td>
              </tr>
            ) : null}

            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                  {isVi ? 'Hồ sơ này chưa có đơn thuốc.' : 'This record has no prescriptions yet.'}
                </td>
              </tr>
            ) : null}

            {items.map((item) => {
              const isEditing = editingPrescriptionId === item.prescriptionId;
              return (
                <tr key={item.prescriptionId} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-2 font-semibold text-slate-900">
                    {item.medicine?.medicineName ?? `#${item.medicineId}`}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {isEditing ? (
                      <InputNumber
                        min={1}
                        value={editingQuantity ? Number(editingQuantity) : undefined}
                        onChange={(value) => setEditingQuantity(value == null ? '' : String(value))}
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {isEditing ? (
                      <InputNumber
                        disabled
                        min={0}
                        value={editingPrice ? Number(editingPrice) : undefined}
                        onChange={(value) => setEditingPrice(value == null ? '' : String(value))}
                      />
                    ) : (
                      item.price.toLocaleString('vi-VN')
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {isEditing ? (
                      <Input value={editingDosage} onChange={(event) => setEditingDosage(event.target.value)} />
                    ) : (
                      item.dosage
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {isEditing ? (
                      <Input
                        value={editingInstruction}
                        onChange={(event) => setEditingInstruction(event.target.value)}
                      />
                    ) : (
                      item.instruction
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {isEditing ? (
                      <Input value={editingNote} onChange={(event) => setEditingNote(event.target.value)} />
                    ) : (
                      item.note || '—'
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <Space>
                        <Button
                          variant="text"
                          color="danger"
                          icon={<X size={16} />}
                          onClick={cancelEdit}
                          disabled={updatePrescriptionMutation.isPending}
                        />
                        <Button
                          variant="text"
                          color="primary"
                          icon={<Save size={16} />}
                          onClick={submitEditPrescription}
                          loading={updatePrescriptionMutation.isPending}
                        />
                      </Space>
                    ) : canUpdatePrescription || canDeletePrescription ? (
                      <Space>
                        {canUpdatePrescription ? (
                          <Button
                            variant="text"
                            color="primary"
                            icon={<Edit size={16} />}
                            onClick={() => void startEditPrescription(item.prescriptionId)}
                            disabled={deletePrescriptionMutation.isPending || isCreatingPrescription}
                          ></Button>
                        ) : null}
                        {canDeletePrescription ? (
                          <DeletePrescriptionButton
                            prescriptionId={item.prescriptionId}
                            isVi={isVi}
                            disabled={
                              deletePrescriptionMutation.isPending ||
                              updatePrescriptionMutation.isPending ||
                              isCreatingPrescription
                            }
                            onDelete={async (prescriptionId) => {
                              setUpdateErrorMessage(null);
                              setUpdateSuccessMessage(null);
                              await deletePrescriptionMutation.mutateAsync(prescriptionId);
                            }}
                          />
                        ) : null}
                      </Space>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
