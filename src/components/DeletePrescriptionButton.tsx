import { Button, Modal } from 'antd';
import { Trash } from 'lucide-react';
import { useState } from 'react';

type DeletePrescriptionButtonProps = {
  prescriptionId: number;
  isVi: boolean;
  disabled?: boolean;
  onDelete: (prescriptionId: number) => Promise<unknown>;
};

export function DeletePrescriptionButton({
  prescriptionId,
  isVi,
  disabled = false,
  onDelete,
}: DeletePrescriptionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const shouldDelete = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: isVi ? 'Xác nhận xóa đơn thuốc' : 'Confirm prescription deletion',
        content: isVi
          ? 'Bạn có chắc chắn muốn xóa đơn thuốc này không?'
          : 'Are you sure you want to delete this prescription?',
        okText: isVi ? 'Xóa' : 'Delete',
        okType: 'danger',
        cancelText: isVi ? 'Hủy' : 'Cancel',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!shouldDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(prescriptionId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      loading={isDeleting}
      variant="text"
      color="danger"
      icon={<Trash size={16} />}
      onClick={() => void handleDelete()}
      disabled={disabled || isDeleting}
    />
  );
}
