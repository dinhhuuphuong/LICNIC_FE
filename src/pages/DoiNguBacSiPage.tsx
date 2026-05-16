import { SectionTitle } from '@/components/common/SectionTitle';
import { StatePanel } from '@/components/common/StatePanel';
import { DEFAULT_AVATAR_URL } from '@/constants';
import { getDoctorPublicDetailRoute } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getActiveDoctorsForHome, type Doctor } from '@/services/doctorService';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function formatConsultationFee(value: string, isVi: boolean) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;

  return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AboutTeamPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'idle' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Đội ngũ bác sĩ' : 'NHA KHOA TẬN TÂM | Our Doctors');

  useEffect(() => {
    let cancelled = false;

    setLoadState('loading');
    setLoadError(null);

    getActiveDoctorsForHome({ limit: 100, page: 1 })
      .then((res) => {
        if (cancelled) return;
        setDoctors(res.data.items ?? []);
        setLoadState('idle');
      })
      .catch((error) => {
        if (cancelled) return;
        setDoctors([]);
        setLoadState('error');
        setLoadError(error instanceof Error ? error.message : 'Error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Đội ngũ bác sĩ' : 'Our Doctors'}
        description={
          isVi
            ? 'Thông tin đội ngũ bác sĩ chuyên môn cao, giàu kinh nghiệm và tận tâm với khách hàng.'
            : 'Meet our highly qualified, experienced, and dedicated team of doctors.'
        }
      />

      {loadState === 'loading' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="h-56 rounded-xl bg-slate-100" />
              <div className="mt-5 h-5 w-2/3 rounded bg-slate-100" />
              <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
              <div className="mt-5 h-10 w-32 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      ) : null}

      {loadState === 'error' ? (
        <StatePanel
          tone="danger"
          title={isVi ? 'Không tải được danh sách bác sĩ' : 'Could not load doctors'}
          description={loadError ?? (isVi ? 'Vui lòng thử lại sau.' : 'Please try again later.')}
        />
      ) : null}

      {loadState === 'idle' && doctors.length === 0 ? (
        <StatePanel
          tone="muted"
          centered
          title={isVi ? 'Chưa có bác sĩ đang hoạt động' : 'No active doctors yet'}
          description={isVi ? 'Danh sách đội ngũ bác sĩ sẽ được cập nhật sớm.' : 'The doctor list will be updated soon.'}
        />
      ) : null}

      {loadState === 'idle' && doctors.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const avatar = doctor.user.avatar?.trim() || DEFAULT_AVATAR_URL;
            const specialization = doctor.specialization?.trim() || (isVi ? 'Bác sĩ nha khoa' : 'Dentist');
            const description =
              doctor.description?.trim() || (isVi ? 'Thông tin đang được cập nhật.' : 'Information coming soon.');

            return (
              <article
                key={doctor.doctorId}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    alt={doctor.user.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    src={avatar}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                      event.currentTarget.nextElementSibling?.classList.remove('hidden');
                      event.currentTarget.nextElementSibling?.classList.add('grid');
                    }}
                  />
                  <div className="hidden h-full w-full place-items-center bg-linear-to-br from-blue-50 to-slate-100">
                    <span className="text-4xl font-black text-blue-200">{initialsFromName(doctor.user.name)}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm font-bold text-blue-700">{specialization}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{doctor.user.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {doctor.experienceYears} {isVi ? 'năm kinh nghiệm' : 'years experience'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {isVi ? 'Phí tư vấn: ' : 'Fee: '}
                      {formatConsultationFee(doctor.consultationFee, isVi)}
                    </span>
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{description}</p>

                  <div className="mt-auto pt-5">
                    <Link
                      to={getDoctorPublicDetailRoute(doctor.doctorId)}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                      {isVi ? 'Xem thông tin chi tiết' : 'View details'}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
