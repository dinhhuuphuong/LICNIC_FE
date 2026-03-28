import type { PatientProfileFormValues } from '@/components/patient/patientProfileForm.shared';
import type { PatientGender } from '@/services/patientService';
import { FormEvent, useEffect, useState } from 'react';

type PatientProfileFormProps = {
  defaultValues: PatientProfileFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  disabled?: boolean;
  isVi: boolean;
  onSubmit: (values: PatientProfileFormValues) => void | Promise<void>;
};

function toFormValues(partial: Partial<PatientProfileFormValues>): PatientProfileFormValues {
  return {
    dateOfBirth: partial.dateOfBirth ?? '',
    gender: partial.gender ?? 'Male',
    address: partial.address ?? '',
    medicalHistory: partial.medicalHistory ?? '',
  };
}

export function PatientProfileForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  disabled,
  isVi,
  onSubmit,
}: PatientProfileFormProps) {
  const [values, setValues] = useState(() => toFormValues(defaultValues));

  useEffect(() => {
    setValues(toFormValues(defaultValues));
  }, [
    defaultValues.dateOfBirth,
    defaultValues.gender,
    defaultValues.address,
    defaultValues.medicalHistory,
    defaultValues,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const genderOptions: { value: PatientGender; labelVi: string; labelEn: string }[] = [
    { value: 'Male', labelVi: 'Nam', labelEn: 'Male' },
    { value: 'Female', labelVi: 'Nữ', labelEn: 'Female' },
  ];

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="patient-dob">
          {isVi ? 'Ngày sinh' : 'Date of birth'}
        </label>
        <input
          id="patient-dob"
          name="dateOfBirth"
          type="date"
          required
          disabled={disabled || isSubmitting}
          className="h-11 w-full max-w-xs rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
          value={values.dateOfBirth}
          onChange={(e) => setValues((v) => ({ ...v, dateOfBirth: e.target.value }))}
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700" id="patient-gender-label">
          {isVi ? 'Giới tính' : 'Gender'}
        </span>
        <div className="flex flex-wrap gap-3" role="group" aria-labelledby="patient-gender-label">
          {genderOptions.map((opt) => (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 has-checked:border-blue-500 has-checked:bg-blue-50 has-checked:text-blue-900"
            >
              <input
                type="radio"
                name="gender"
                value={opt.value}
                checked={values.gender === opt.value}
                disabled={disabled || isSubmitting}
                onChange={() => setValues((v) => ({ ...v, gender: opt.value }))}
                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {isVi ? opt.labelVi : opt.labelEn}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="patient-address">
          {isVi ? 'Địa chỉ' : 'Address'}
        </label>
        <input
          id="patient-address"
          name="address"
          type="text"
          autoComplete="street-address"
          disabled={disabled || isSubmitting}
          placeholder={isVi ? 'Số nhà, đường, quận/huyện, tỉnh/thành' : 'Street, district, city'}
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
          value={values.address}
          onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="patient-medical">
          {isVi ? 'Tiền sử bệnh / dị ứng (tuỳ chọn)' : 'Medical history / allergies (optional)'}
        </label>
        <textarea
          id="patient-medical"
          name="medicalHistory"
          rows={4}
          disabled={disabled || isSubmitting}
          placeholder={
            isVi
              ? 'Ví dụ: dị ứng thuốc, bệnh nền liên quan điều trị nha khoa...'
              : 'e.g. drug allergies, conditions relevant to dental care...'
          }
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
          value={values.medicalHistory}
          onChange={(e) => setValues((v) => ({ ...v, medicalHistory: e.target.value }))}
        />
      </div>

      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="inline-flex h-12 items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-sky-600 px-8 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (isVi ? 'Đang lưu...' : 'Saving...') : submitLabel}
      </button>
    </form>
  );
}
