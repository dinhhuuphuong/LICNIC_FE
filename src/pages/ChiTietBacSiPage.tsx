import { StatePanel } from '@/components/common/StatePanel';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getDoctorDetail } from '@/services/doctorService';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export function DoctorDetailPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { doctorId: doctorIdParam } = useParams<{ doctorId: string }>();
  const doctorId = Number(doctorIdParam);
  const validId = Number.isInteger(doctorId) && doctorId > 0;

  const [loadState, setLoadState] = useState<'loading' | 'idle' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<Awaited<ReturnType<typeof getDoctorDetail>>['data'] | null>(null);

  useDocumentTitle(
    doctor
      ? `NHA KHOA TAN TAM | ${doctor.user.name}`
      : isVi
        ? 'NHA KHOA TAN TAM | Chi tiet bac si'
        : 'NHA KHOA TAN TAM | Doctor detail',
  );

  useEffect(() => {
    if (!validId) {
      setLoadState('error');
      setLoadError(isVi ? 'Ma bac si khong hop le.' : 'Invalid doctor id.');
      return;
    }

    let cancelled = false;
    setLoadState('loading');
    setLoadError(null);
    setDoctor(null);

    getDoctorDetail(doctorId)
      .then((res) => {
        if (cancelled) return;
        setDoctor(res.data);
        setLoadState('idle');
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadState('error');
        setLoadError(e instanceof Error ? e.message : 'Error');
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId, isVi, validId]);

  if (loadState === 'loading') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 w-72 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (loadState === 'error' || !doctor) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1080px] rounded-3xl p-8"
        title={isVi ? 'Khong tai duoc thong tin bac si' : 'Could not load doctor information'}
        description={loadError ?? 'Error'}
        action={
          <Link className="text-sm font-semibold text-blue-600 underline" to={ROUTES.aboutTeam}>
            {isVi ? 'Ve doi ngu bac si' : 'Back to doctor team'}
          </Link>
        }
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1080px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {doctor.user.avatar ? (
            <img src={doctor.user.avatar} alt={doctor.user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full min-h-[220px] place-items-center text-5xl text-slate-300">DR</div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{isVi ? 'Ho so bac si' : 'Doctor profile'}</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">{doctor.user.name}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">{doctor.specialization || (isVi ? 'Bac si nha khoa' : 'Dentist')}</p>
          <p className="mt-1 text-sm text-slate-500">
            {isVi ? 'Kinh nghiem:' : 'Experience:'} {doctor.experienceYears} {isVi ? 'nam' : 'years'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {isVi ? 'Phi tu van:' : 'Consultation fee:'} {doctor.consultationFee}
          </p>

          <div className="mt-5 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            {doctor.description?.trim() || (isVi ? 'Thong tin dang duoc cap nhat.' : 'Information is being updated.')}
          </div>

          <div className="mt-5">
            <Link className="text-sm font-semibold text-blue-700 underline" to={ROUTES.aboutTeam}>
              {isVi ? 'Ve danh sach doi ngu bac si' : 'Back to doctor team'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
