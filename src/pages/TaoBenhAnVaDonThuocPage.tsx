import { PageCard } from '@/components/common/PageCard';
import { StatePanel } from '@/components/common/StatePanel';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { createMedicalRecordWithPrescriptions } from '@/services/medicalRecordService';
import { type Medicine, getMedicines } from '@/services/medicineService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Input, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

type PrescriptionFormItem = {
  medicineId: string;
  quantity: string;
  price: string;
  dosage: string;
  instruction: string;
};

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

function getEmptyPrescription(): PrescriptionFormItem {
  return {
    medicineId: '',
    quantity: '',
    price: '',
    dosage: '',
    instruction: '',
  };
}

function extractMedicinesFromResponse(data: unknown): Medicine[] {
  if (Array.isArray(data)) return data as Medicine[];
  if (data && typeof data === 'object') {
    const maybeObj = data as { items?: unknown; medicineId?: unknown };
    if (Array.isArray(maybeObj.items)) return maybeObj.items as Medicine[];
    if (typeof maybeObj.medicineId === 'number') return [data as Medicine];
  }
  return [];
}

export function TaoBenhAnVaDonThuocPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [note, setNote] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionFormItem[]>([getEmptyPrescription()]);
  const [medicineKeyword, setMedicineKeyword] = useState('');
  const [debouncedMedicineKeyword, setDebouncedMedicineKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [navigateTimeoutId, setNavigateTimeoutId] = useState<number | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Tạo bệnh án và toa thuốc' : 'NHA KHOA TAN TAM | Create medical record');

  const appointmentId = Number(searchParams.get('appointmentId'));
  const hasValidAppointmentId = Number.isFinite(appointmentId) && appointmentId > 0;

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedMedicineKeyword(medicineKeyword);
    }, 400);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [medicineKeyword]);

  const medicinesQuery = useQuery({
    queryKey: ['medicines', debouncedMedicineKeyword || 'all'],
    queryFn: async () => {
      const res = await getMedicines({
        keyword: debouncedMedicineKeyword.trim() || undefined,
        page: 1,
        limit: 20,
      });
      return extractMedicinesFromResponse(res.data);
    },
    enabled: true,
  });

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để tạo bệnh án.' : 'Please sign in to create medical records.'}
        action={
          <Button type="primary" size="large" onClick={() => navigate(ROUTES.login)}>
            {isVi ? 'Đăng nhập' : 'Login'}
          </Button>
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
        description={isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctors.'}
        action={
          <Button type="link" onClick={() => navigate(ROUTES.home)}>
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </Button>
        }
      />
    );
  }

  if (!hasValidAppointmentId) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Thiếu mã lịch hẹn' : 'Missing appointment id'}
        description={
          isVi
            ? 'Vui lòng mở trang này từ lịch hẹn đã check-in của bác sĩ.'
            : 'Open this page from a checked-in appointment.'
        }
        action={
          <Link to={ROUTES.doctorAppointments} className="text-sm font-semibold text-blue-600 underline">
            {isVi ? 'Về trang quản lý lịch' : 'Back to appointments'}
          </Link>
        }
      />
    );
  }

  const updatePrescription = (index: number, field: keyof PrescriptionFormItem, value: string) => {
    setPrescriptions((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSelectMedicine = (index: number, medicineIdValue?: string) => {
    if (!medicineIdValue) {
      setPrescriptions((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                medicineId: '',
              }
            : item,
        ),
      );
      return;
    }

    const selected = medicinesQuery.data?.find((medicine) => String(medicine.medicineId) === medicineIdValue);
    setPrescriptions((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              medicineId: medicineIdValue,
              price: selected?.price != null ? String(selected.price) : item.price,
            }
          : item,
      ),
    );
  };

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [...prev, getEmptyPrescription()]);
  };

  const removePrescriptionRow = (index: number) => {
    setPrescriptions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const diagnosisTrimmed = diagnosis.trim();
    const treatmentTrimmed = treatment.trim();
    if (!diagnosisTrimmed || !treatmentTrimmed) {
      setErrorMessage(isVi ? 'Vui lòng nhập chẩn đoán và điều trị.' : 'Diagnosis and treatment are required.');
      return;
    }

    const normalizedPrescriptions = prescriptions.map((item) => ({
      medicineId: Number(item.medicineId),
      quantity: Number(item.quantity),
      price: Number(item.price),
      dosage: item.dosage.trim(),
      instruction: item.instruction.trim(),
    }));

    const hasInvalidPrescription = normalizedPrescriptions.some(
      (item) =>
        !Number.isFinite(item.medicineId) ||
        item.medicineId <= 0 ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !item.dosage ||
        !item.instruction,
    );

    if (hasInvalidPrescription) {
      setErrorMessage(
        isVi
          ? 'Danh sách thuốc chưa hợp lệ. Vui lòng kiểm tra medicineId, số lượng, giá, liều dùng và hướng dẫn.'
          : 'Invalid prescriptions. Please check medicine id, quantity, price, dosage, and instruction.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createMedicalRecordWithPrescriptions({
        appointmentId,
        diagnosis: diagnosisTrimmed,
        treatment: treatmentTrimmed,
        note: note.trim() || undefined,
        prescriptions: normalizedPrescriptions,
      });
      setSuccessMessage(isVi ? 'Tạo hồ sơ bệnh án thành công.' : 'Medical record created successfully.');
      if (navigateTimeoutId) {
        window.clearTimeout(navigateTimeoutId);
      }
      const timeoutId = window.setTimeout(() => {
        navigate(ROUTES.doctorAppointments);
      }, 800);
      setNavigateTimeoutId(timeoutId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : isVi ? 'Tạo bệnh án thất bại.' : 'Create failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-4">
      <div>
        <Link to={ROUTES.doctorAppointments} className="text-sm font-semibold text-blue-600 underline">
          {isVi ? '← Quay lại quản lý đặt lịch' : '← Back to appointments'}
        </Link>
      </div>

      <header>
        <h1 className="text-3xl font-black text-slate-900">
          {isVi ? 'Tạo hồ sơ bệnh án và toa thuốc' : 'Create medical record and prescriptions'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isVi ? 'Lịch hẹn #' : 'Appointment #'}
          <span className="font-bold text-slate-900">{appointmentId}</span>
        </p>
      </header>

      {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}
      {successMessage ? <Alert type="success" showIcon message={successMessage} /> : null}

      <PageCard>
        <div className="grid gap-4">
          <div>
            <label htmlFor="diagnosis" className="mb-2 block text-sm font-semibold text-slate-700">
              {isVi ? 'Chẩn đoán' : 'Diagnosis'}
            </label>
            <Input.TextArea
              id="diagnosis"
              rows={4}
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              placeholder={isVi ? 'Ví dụ: Sâu răng R16' : 'Example: Caries R16'}
            />
          </div>

          <div>
            <label htmlFor="treatment" className="mb-2 block text-sm font-semibold text-slate-700">
              {isVi ? 'Điều trị' : 'Treatment'}
            </label>
            <Input.TextArea
              id="treatment"
              rows={4}
              value={treatment}
              onChange={(event) => setTreatment(event.target.value)}
              placeholder={isVi ? 'Ví dụ: Trám composite' : 'Example: Composite filling'}
            />
          </div>

          <div>
            <label htmlFor="note" className="mb-2 block text-sm font-semibold text-slate-700">
              {isVi ? 'Ghi chú' : 'Note'}
            </label>
            <Input.TextArea
              id="note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={isVi ? 'Ví dụ: Tái khám sau 1 tuần' : 'Example: Follow-up after 1 week'}
            />
          </div>
        </div>
      </PageCard>

      <PageCard>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Danh sách thuốc' : 'Prescription list'}</h2>
            <Button type="dashed" onClick={addPrescriptionRow}>
              {isVi ? '+ Thêm thuốc' : '+ Add medicine'}
            </Button>
          </div>

          {prescriptions.map((item, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">
                  {isVi ? 'Thuốc #' : 'Medicine #'}
                  {index + 1}
                </p>
                <Button
                  type="link"
                  danger
                  onClick={() => removePrescriptionRow(index)}
                  disabled={prescriptions.length <= 1}
                >
                  {isVi ? 'Xóa' : 'Remove'}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Select
                  value={item.medicineId || undefined}
                  onChange={(value) => handleSelectMedicine(index, value)}
                  options={(medicinesQuery.data ?? []).map((medicine) => ({
                    value: String(medicine.medicineId),
                    label: `${medicine.medicineName}${medicine.activeIngredient ? ` - ${medicine.activeIngredient}` : ''}`,
                  }))}
                  placeholder={isVi ? 'Chọn thuốc' : 'Select medicine'}
                  loading={medicinesQuery.isFetching}
                  showSearch={{
                    filterOption: false,
                    onSearch: (value) => setMedicineKeyword(value),
                  }}
                  allowClear
                />
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder={isVi ? 'Số lượng' : 'Quantity'}
                  value={item.quantity ? Number(item.quantity) : null}
                  onChange={(value) => updatePrescription(index, 'quantity', value != null ? String(value) : '')}
                />
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder={isVi ? 'Giá' : 'Price'}
                  value={item.price ? Number(item.price) : null}
                  onChange={(value) => updatePrescription(index, 'price', value != null ? String(value) : '')}
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Input
                  placeholder={isVi ? 'Liều dùng' : 'Dosage'}
                  value={item.dosage}
                  onChange={(event) => updatePrescription(index, 'dosage', event.target.value)}
                />
                <Input
                  placeholder={isVi ? 'Hướng dẫn' : 'Instruction'}
                  value={item.instruction}
                  onChange={(event) => updatePrescription(index, 'instruction', event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </PageCard>

      <div className="flex justify-end gap-2">
        <Button onClick={() => navigate(ROUTES.doctorAppointments)} disabled={isSubmitting}>
          {isVi ? 'Hủy' : 'Cancel'}
        </Button>
        <Button type="primary" onClick={() => void handleSubmit()} loading={isSubmitting}>
          {isVi ? 'Tạo bệnh án' : 'Create record'}
        </Button>
      </div>
    </div>
  );
}
