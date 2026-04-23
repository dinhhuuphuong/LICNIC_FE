import type { Patient } from '@/services/patientService';
import { updateMe } from '@/services/userService';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { FormEvent, useEffect, useId, useRef, useState } from 'react';

export type AccountSummaryCardProps = {
  patient: Patient;
  isVi: boolean;
  onAccountUpdated?: () => void;
};

type FormState = {
  name: string;
  phone: string;
  avatar: string;
};

function toFormState(patient: Patient): FormState {
  const u = patient.user;
  return {
    name: u?.name ?? '',
    phone: u?.phone ?? '',
    avatar: u?.avatar ?? '',
  };
}

export function AccountSummaryCard({ patient, isVi, onAccountUpdated }: AccountSummaryCardProps) {
  const email = patient.user?.email ?? '—';
  const [values, setValues] = useState(() => toFormState(patient));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileInputId = useId();

  useEffect(() => {
    setValues(toFormState(patient));
    setAvatarFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setAvatarPreview(null);
  }, [patient]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (args: { name: string; phone: string | null; avatar: string | null; file: File | null }) => {
      const res = await updateMe(
        {
          name: args.name,
          phone: args.phone,
          avatar: args.avatar,
        },
        args.file,
      );
      return res;
    },
    onSuccess: () => {
      onAccountUpdated?.();
    },
    onError: (error) => {
      message.error(
        error instanceof Error
          ? error.message
          : isVi
            ? 'Cập nhật thông tin tài khoản thất bại'
            : 'Update account failed',
      );
    },
  });

  const displayAvatarSrc = avatarPreview ?? (values.avatar.trim() || null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = values.name.trim();
    if (!name) return;
    const phoneTrim = values.phone.trim();
    const avatarTrim = values.avatar.trim();
    await mutation.mutateAsync({
      name,
      phone: phoneTrim || null,
      avatar: avatarTrim || null,
      file: avatarFile,
    });
  };

  const handlePickFile = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setAvatarPreview(url);
    setAvatarFile(file);
  };

  const clearPickedFile = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const errMsg =
    mutation.error instanceof Error ? mutation.error.message : mutation.isError ? String(mutation.error) : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{isVi ? 'Tài khoản' : 'Account'}</h2>

      <form className="mt-4 space-y-4" onSubmit={(ev) => void handleSubmit(ev)}>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="account-name">
            {isVi ? 'Họ tên' : 'Full name'}
          </label>
          <input
            id="account-name"
            type="text"
            autoComplete="name"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500/30 focus:border-blue-500 focus:ring-2"
            value={values.name}
            onChange={(ev) => setValues((v) => ({ ...v, name: ev.target.value }))}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="account-email">
            Email
          </label>
          <input
            id="account-email"
            type="email"
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            value={email === '—' ? '' : email}
            placeholder={email === '—' ? '—' : undefined}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="account-phone">
            {isVi ? 'Điện thoại' : 'Phone'}
          </label>
          <input
            id="account-phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500/30 focus:border-blue-500 focus:ring-2"
            value={values.phone}
            onChange={(ev) => setValues((v) => ({ ...v, phone: ev.target.value }))}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-500">{isVi ? 'Ảnh đại diện' : 'Avatar'}</label>
          <div className="flex flex-wrap items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {displayAvatarSrc ? (
                <img src={displayAvatarSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  {isVi ? 'Chưa có' : 'None'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="block w-full max-w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 hover:file:bg-slate-200"
                onChange={(ev) => handlePickFile(ev.target.files)}
              />
              {avatarFile ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-600 underline"
                  onClick={clearPickedFile}
                >
                  {isVi ? 'Bỏ ảnh đã chọn' : 'Remove selected file'}
                </button>
              ) : null}
              <p className="text-xs text-slate-500">
                {isVi ? 'PNG, JPG, WebP… (tối đa 5 MB trên server).' : 'PNG, JPG, WebP… (max 5 MB on server).'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="account-avatar-url">
            {isVi ? 'Hoặc URL ảnh đại diện' : 'Or avatar URL'}
          </label>
          <input
            id="account-avatar-url"
            type="url"
            inputMode="url"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-500/30 focus:border-blue-500 focus:ring-2"
            value={values.avatar}
            onChange={(ev) => setValues((v) => ({ ...v, avatar: ev.target.value }))}
            placeholder={isVi ? 'https://…' : 'https://…'}
          />
          <p className="mt-1 text-xs text-slate-500">
            {isVi
              ? 'Nếu bạn chọn ảnh để tải lên, ảnh đó sẽ được ghi đè lên URL này sau khi lưu.'
              : 'If you upload a file, it will replace this URL after save.'}
          </p>
        </div>

        {errMsg ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
            {errMsg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="cursor-pointer inline-flex h-10 w-full items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-bold text-white! disabled:opacity-60"
        >
          {mutation.isPending ? (isVi ? 'Đang lưu…' : 'Saving…') : isVi ? 'Lưu thông tin tài khoản' : 'Save account'}
        </button>
      </form>
    </div>
  );
}
