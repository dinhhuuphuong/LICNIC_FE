import { AppointmentStatusBadge, type AppointmentStatus } from '@/components/AppointmentStatusBadge';
import { PageCard } from '@/components/common/PageCard';
import { DoctorRecordPrescriptionsTable } from '@/components/DoctorRecordPrescriptionsTable';
import type { MedicalRecord } from '@/services/medicalRecordService';
import { formatYmdToDmy } from '@/utils/dateDisplay';
import { Modal } from 'antd';
import { useState } from 'react';

type DoctorMedicalRecordCardProps = {
  record: MedicalRecord;
  isVi: boolean;
  expanded: boolean;
  onTogglePrescriptions: (recordId: number) => void;
  onEditRecord: (record: MedicalRecord) => void;
  onCreatePrescription: (recordId: number) => void;
  onDeleteRecord: (recordId: number) => Promise<unknown>;
  onCompleteAppointment: (appointmentId: number) => Promise<unknown>;
  createRequestKey?: number;
};

export function DoctorMedicalRecordCard({
  record,
  isVi,
  expanded,
  onTogglePrescriptions,
  onEditRecord,
  onCreatePrescription,
  onDeleteRecord,
  onCompleteAppointment,
  createRequestKey,
}: DoctorMedicalRecordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false);
  const normalizedStatus = (record.appointment?.status ?? '').toLowerCase().replace('-', '_');
  const appointmentStatus = normalizedStatus as AppointmentStatus | '';
  const hasAppointmentStatus = appointmentStatus.length > 0;
  const canEditRecord = appointmentStatus === 'checked_in';
  const canDeleteRecord = appointmentStatus === 'checked_in';
  const canCreatePrescription = appointmentStatus === 'checked_in';
  const canCompleteAppointment = appointmentStatus === 'checked_in';
  const canTogglePrescriptions = appointmentStatus === 'checked_in';

  const handleDeleteRecord = async () => {
    const shouldDelete = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: isVi ? 'Xác nhận xóa hồ sơ bệnh án' : 'Confirm medical record deletion',
        content: isVi
          ? `Bạn có chắc chắn muốn xóa hồ sơ #${record.recordId} không?`
          : `Are you sure you want to delete record #${record.recordId}?`,
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
      await onDeleteRecord(record.recordId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompleteAppointment = async () => {
    const shouldComplete = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: isVi ? 'Xác nhận hoàn tất khám bệnh' : 'Confirm complete appointment',
        content: isVi
          ? `Bạn có chắc muốn hoàn tất lịch hẹn #${record.appointmentId}?`
          : `Are you sure you want to complete appointment #${record.appointmentId}?`,
        okText: isVi ? 'Hoàn tất' : 'Complete',
        cancelText: isVi ? 'Hủy' : 'Cancel',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!shouldComplete) return;

    setIsCompletingAppointment(true);
    try {
      await onCompleteAppointment(record.appointmentId);
    } finally {
      setIsCompletingAppointment(false);
    }
  };

  return (
    <PageCard>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">#{record.recordId}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            {isVi ? 'Lịch hẹn #' : 'Appointment #'}
            {record.appointmentId}
          </span>
          {hasAppointmentStatus ? (
            <AppointmentStatusBadge status={appointmentStatus as AppointmentStatus} isVi={isVi} />
          ) : null}
        </div>
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{isVi ? 'Bệnh nhân: ' : 'Patient: '}</strong>
          {record.patient?.user?.name ?? `#${record.patientId}`}
        </p>
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{isVi ? 'Chẩn đoán: ' : 'Diagnosis: '}</strong>
          {record.diagnosis}
        </p>
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">{isVi ? 'Điều trị: ' : 'Treatment: '}</strong>
          {record.treatment}
        </p>
        {record.note ? (
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{isVi ? 'Ghi chú: ' : 'Note: '}</strong>
            {record.note}
          </p>
        ) : null}
        <p className="text-sm text-slate-500">
          {isVi ? 'Ngày tạo: ' : 'Created at: '}
          {formatYmdToDmy(record.createdAt)}
          {record.appointment?.appointmentDate ? (
            <>
              {' · '}
              {isVi ? 'Ngày khám: ' : 'Visit date: '}
              {formatYmdToDmy(record.appointment.appointmentDate)}
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {canEditRecord ? (
            <button
              type="button"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-blue-500 bg-white px-4 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
              onClick={() => onEditRecord(record)}
              disabled={isDeleting || isCompletingAppointment}
            >
              {isVi ? 'Chỉnh sửa bệnh án' : 'Edit medical record'}
            </button>
          ) : null}
          {canTogglePrescriptions ? (
            <button
              type="button"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-emerald-500 bg-white px-4 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
              onClick={() => onTogglePrescriptions(record.recordId)}
              disabled={isDeleting || isCompletingAppointment}
            >
              {expanded
                ? isVi
                  ? 'Ẩn đơn thuốc'
                  : 'Hide prescriptions'
                : isVi
                  ? 'Xem đơn thuốc'
                  : 'View prescriptions'}
            </button>
          ) : null}
          {canCompleteAppointment ? (
            <button
              type="button"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-violet-500 bg-white px-4 text-xs font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => void handleCompleteAppointment()}
              disabled={isDeleting || isCompletingAppointment}
            >
              {isCompletingAppointment
                ? isVi
                  ? 'Đang hoàn tất...'
                  : 'Completing...'
                : isVi
                  ? 'Hoàn tất khám'
                  : 'Complete appointment'}
            </button>
          ) : null}
          {canDeleteRecord ? (
            <button
              type="button"
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-red-500 bg-white px-4 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => void handleDeleteRecord()}
              disabled={isDeleting || isCompletingAppointment}
            >
              {isDeleting ? (isVi ? 'Đang xóa...' : 'Deleting...') : isVi ? 'Xóa bệnh án' : 'Delete record'}
            </button>
          ) : null}
          {canCreatePrescription ? (
            <button
              type="button"
              className="ml-auto inline-flex min-h-9 items-center justify-center rounded-full border border-emerald-500 bg-white px-4 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => onCreatePrescription(record.recordId)}
              disabled={isDeleting || isCompletingAppointment}
            >
              {isVi ? 'Thêm đơn thuốc' : 'Add prescription'}
            </button>
          ) : null}
        </div>
        {expanded ? (
          <div className="pt-2">
            <DoctorRecordPrescriptionsTable
              appointmentStatus={appointmentStatus as AppointmentStatus}
              recordId={record.recordId}
              isVi={isVi}
              createRequestKey={createRequestKey}
            />
          </div>
        ) : null}
      </div>
    </PageCard>
  );
}
