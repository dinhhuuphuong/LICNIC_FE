import { FormEvent, useEffect, useState } from 'react';

export type DoctorProfileFormValues = {
  specialization: string;
  experienceYears: string;
  consultationFee: string;
  description: string;
};

type DoctorProfileFormProps = {
  defaultValues: DoctorProfileFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  disabled?: boolean;
  isVi: boolean;
  onSubmit: (values: DoctorProfileFormValues) => void | Promise<void>;
};

function toFormValues(partial: Partial<DoctorProfileFormValues>): DoctorProfileFormValues {
  return {
    specialization: partial.specialization ?? '',
    experienceYears: partial.experienceYears ?? '',
    consultationFee: partial.consultationFee ?? '',
    description: partial.description ?? '',
  };
}

export function DoctorProfileForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  disabled,
  isVi,
  onSubmit,
}: DoctorProfileFormProps) {
  const [values, setValues] = useState(() => toFormValues(defaultValues));

  useEffect(() => {
    setValues(toFormValues(defaultValues));
  }, [
    defaultValues.specialization,
    defaultValues.experienceYears,
    defaultValues.consultationFee,
    defaultValues.description,
    defaultValues,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="doctor-specialization">
          {isVi ? 'Chuyên khoa' : 'Specialization'}
        </label>
        <input
          id="doctor-specialization"
          name="specialization"
          type="text"
          required
          disabled={disabled || isSubmitting}
          className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
          value={values.specialization}
          onChange={(event) => setValues((prev) => ({ ...prev, specialization: event.target.value }))}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="doctor-experience-years">
            {isVi ? 'Số năm kinh nghiệm' : 'Experience years'}
          </label>
          <input
            id="doctor-experience-years"
            name="experienceYears"
            type="number"
            required
            min={0}
            disabled={disabled || isSubmitting}
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
            value={values.experienceYears}
            onChange={(event) => setValues((prev) => ({ ...prev, experienceYears: event.target.value }))}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="doctor-consultation-fee">
            {isVi ? 'Phí tư vấn (VND)' : 'Consultation fee (VND)'}
          </label>
          <input
            id="doctor-consultation-fee"
            name="consultationFee"
            type="number"
            required
            min={0}
            disabled={disabled || isSubmitting}
            className="h-11 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
            value={values.consultationFee}
            onChange={(event) => setValues((prev) => ({ ...prev, consultationFee: event.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="doctor-description">
          {isVi ? 'Mô tả' : 'Description'}
        </label>
        <textarea
          id="doctor-description"
          name="description"
          rows={5}
          required
          disabled={disabled || isSubmitting}
          className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:bg-slate-50"
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
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
