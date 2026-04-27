import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import { DoctorMedicalRecordCard } from '@/components/DoctorMedicalRecordCard';
import { DoctorMedicalRecordEditForm } from '@/components/DoctorMedicalRecordEditForm';
import { DoctorMedicalRecordsHeader } from '@/components/DoctorMedicalRecordsHeader';
import { DoctorMedicalRecordsSummaryCard } from '@/components/DoctorMedicalRecordsSummaryCard';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { completeAppointment } from '@/services/appointmentService';
import {
  deleteMedicalRecord,
  getMedicalRecordDetail,
  listMedicalRecords,
  updateMedicalRecord,
} from '@/services/medicalRecordService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'antd';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export function QuanLyHoSoBenhNhanBacSiPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [expandedRecordIds, setExpandedRecordIds] = useState<number[]>([]);
  const [createPrescriptionRequestByRecord, setCreatePrescriptionRequestByRecord] = useState<Record<number, number>>(
    {},
  );
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState('');
  const [editingDiagnosis, setEditingDiagnosis] = useState('');
  const [editingTreatment, setEditingTreatment] = useState('');
  const [editingNote, setEditingNote] = useState('');
  const [isLoadingRecordDetail, setIsLoadingRecordDetail] = useState(false);
  const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý hồ sơ bệnh nhân' : 'NHA KHOA TAN TAM | Manage patient records');

  const patientId = toPositiveInt(searchParams.get('patientId'), 0);
  const doctorId = toPositiveInt(searchParams.get('doctorId'), 0);
  const appointmentId = toPositiveInt(searchParams.get('appointmentId'), 0);
  const page = toPositiveInt(searchParams.get('page'), 1);
  const limit = toPositiveInt(searchParams.get('limit'), 10);
  const hasRequiredQuery = patientId > 0 && doctorId > 0 && appointmentId > 0;

  const medicalRecordsQuery = useQuery({
    queryKey: ['doctorMedicalRecordsManage', patientId, doctorId, appointmentId, page, limit],
    queryFn: () =>
      listMedicalRecords({
        patientId,
        doctorId,
        appointmentId,
        page,
        limit,
      }),
    enabled: hasRequiredQuery,
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={
          isVi ? 'Vui lòng đăng nhập để quản lý hồ sơ bệnh án.' : 'Please sign in to manage medical records.'
        }
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.DOCTOR.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (!hasRequiredQuery) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Thiếu tham số lọc bệnh án' : 'Missing medical record filters'}
        description={
          isVi
            ? 'Cần có patientId, doctorId, appointmentId để mở trang quản lý hồ sơ.'
            : 'patientId, doctorId, and appointmentId are required to open this page.'
        }
        action={
          <Link to={ROUTES.doctorAppointments} className="text-sm font-semibold text-blue-600 underline">
            {isVi ? 'Về quản lý đặt lịch' : 'Back to appointments'}
          </Link>
        }
      />
    );
  }

  if (medicalRecordsQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-72 rounded-lg bg-slate-200" />
        <div className="h-40 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (medicalRecordsQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được danh sách bệnh án' : 'Could not load medical records'}
        description={medicalRecordsQuery.error instanceof Error ? medicalRecordsQuery.error.message : 'Error'}
      />
    );
  }

  const records = medicalRecordsQuery.data?.data.items ?? [];
  const total = medicalRecordsQuery.data?.data.total ?? 0;

  const toggleRecordPrescriptions = (recordId: number) => {
    setExpandedRecordIds((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId],
    );
  };

  const handleCreatePrescription = (recordId: number) => {
    setExpandedRecordIds((prev) => (prev.includes(recordId) ? prev : [...prev, recordId]));
    setCreatePrescriptionRequestByRecord((prev) => ({
      ...prev,
      [recordId]: (prev[recordId] ?? 0) + 1,
    }));
  };

  const handleDeleteRecord = async (recordId: number) => {
    setEditErrorMessage(null);
    setEditSuccessMessage(null);
    try {
      await deleteMedicalRecord(recordId);
      setEditSuccessMessage(isVi ? 'Xóa hồ sơ bệnh án thành công.' : 'Medical record deleted successfully.');
      setExpandedRecordIds((prev) => prev.filter((id) => id !== recordId));
      setCreatePrescriptionRequestByRecord((prev) => {
        const next = { ...prev };
        delete next[recordId];
        return next;
      });
      if (editingRecordId === recordId) {
        resetEditForm();
      }
      await queryClient.invalidateQueries({
        queryKey: ['doctorMedicalRecordsManage', patientId, doctorId, appointmentId, page, limit],
      });
    } catch (error) {
      setEditErrorMessage(error instanceof Error ? error.message : isVi ? 'Xóa bệnh án thất bại.' : 'Delete failed.');
      throw error;
    }
  };

  const handleCompleteAppointment = async (selectedAppointmentId: number) => {
    setEditErrorMessage(null);
    setEditSuccessMessage(null);
    try {
      await completeAppointment(selectedAppointmentId);
      setEditSuccessMessage(isVi ? 'Hoàn tất lịch khám thành công.' : 'Appointment completed successfully.');
      await queryClient.invalidateQueries({
        queryKey: ['doctorMedicalRecordsManage', patientId, doctorId, appointmentId, page, limit],
      });
    } catch (error) {
      setEditErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Hoàn tất lịch khám thất bại.' : 'Complete failed.',
      );
      throw error;
    }
  };

  const resetEditForm = () => {
    setEditingRecordId(null);
    setEditingAppointmentId('');
    setEditingDiagnosis('');
    setEditingTreatment('');
    setEditingNote('');
    setIsLoadingRecordDetail(false);
  };

  const handleEditRecord = async (recordId: number) => {
    setIsLoadingRecordDetail(true);
    setEditErrorMessage(null);
    setEditSuccessMessage(null);

    try {
      const response = await getMedicalRecordDetail(recordId);
      const detail = response.data;
      setEditingRecordId(detail.recordId);
      setEditingAppointmentId(String(detail.appointmentId));
      setEditingDiagnosis(detail.diagnosis ?? '');
      setEditingTreatment(detail.treatment ?? '');
      setEditingNote(detail.note ?? '');
    } catch (error) {
      setEditErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Không tải được bệnh án.' : 'Cannot load record.',
      );
    } finally {
      setIsLoadingRecordDetail(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingRecordId) return;

    setEditErrorMessage(null);
    setEditSuccessMessage(null);

    const appointmentIdValue = Number(editingAppointmentId);
    const diagnosisValue = editingDiagnosis.trim();
    const treatmentValue = editingTreatment.trim();
    const noteValue = editingNote.trim();

    if (!Number.isFinite(appointmentIdValue) || appointmentIdValue <= 0) {
      setEditErrorMessage(isVi ? 'appointmentId không hợp lệ.' : 'Invalid appointmentId.');
      return;
    }
    if (!diagnosisValue || !treatmentValue) {
      setEditErrorMessage(isVi ? 'Vui lòng nhập chẩn đoán và điều trị.' : 'Diagnosis and treatment are required.');
      return;
    }

    setIsUpdatingRecord(true);
    try {
      await updateMedicalRecord(editingRecordId, {
        appointmentId: appointmentIdValue,
        diagnosis: diagnosisValue,
        treatment: treatmentValue,
        note: noteValue || undefined,
      });
      setEditSuccessMessage(isVi ? 'Cập nhật hồ sơ bệnh án thành công.' : 'Medical record updated successfully.');
      await queryClient.invalidateQueries({
        queryKey: ['doctorMedicalRecordsManage', patientId, doctorId, appointmentId, page, limit],
      });
      resetEditForm();
    } catch (error) {
      setEditErrorMessage(
        error instanceof Error ? error.message : isVi ? 'Cập nhật bệnh án thất bại.' : 'Update failed.',
      );
    } finally {
      setIsUpdatingRecord(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-4">
      <DoctorMedicalRecordsHeader isVi={isVi} appointmentId={appointmentId} patientId={patientId} />

      <DoctorMedicalRecordsSummaryCard
        isVi={isVi}
        total={total}
        onCreateRecord={() => navigate(`${ROUTES.doctorMedicalRecordCreate}?appointmentId=${appointmentId}`)}
      />

      {editErrorMessage ? <Alert type="error" showIcon message={editErrorMessage} /> : null}
      {editSuccessMessage ? <Alert type="success" showIcon message={editSuccessMessage} /> : null}

      {editingRecordId ? (
        <DoctorMedicalRecordEditForm
          isVi={isVi}
          editingRecordId={editingRecordId}
          editingDiagnosis={editingDiagnosis}
          editingTreatment={editingTreatment}
          editingNote={editingNote}
          isUpdatingRecord={isUpdatingRecord}
          onChangeDiagnosis={setEditingDiagnosis}
          onChangeTreatment={setEditingTreatment}
          onChangeNote={setEditingNote}
          onClose={resetEditForm}
          onSubmit={() => void handleSubmitEdit()}
        />
      ) : null}

      {isLoadingRecordDetail ? (
        <PageCard>
          <p className="text-sm text-slate-600">
            {isVi ? 'Đang tải chi tiết bệnh án...' : 'Loading record details...'}
          </p>
        </PageCard>
      ) : null}

      {records.length === 0 ? (
        <PageCard>
          <p className="text-sm text-slate-600">
            {isVi
              ? 'Chưa có hồ sơ bệnh án nào theo bộ lọc hiện tại.'
              : 'No medical records found with current filters.'}
          </p>
        </PageCard>
      ) : (
        records.map((record) => (
          <DoctorMedicalRecordCard
            key={record.recordId}
            record={record}
            isVi={isVi}
            expanded={expandedRecordIds.includes(record.recordId)}
            onTogglePrescriptions={toggleRecordPrescriptions}
            onEditRecord={(selectedRecord) => void handleEditRecord(selectedRecord.recordId)}
            onCreatePrescription={handleCreatePrescription}
            onDeleteRecord={handleDeleteRecord}
            onCompleteAppointment={handleCompleteAppointment}
            createRequestKey={createPrescriptionRequestByRecord[record.recordId]}
          />
        ))
      )}
    </div>
  );
}
