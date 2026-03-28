import { DEFAULT_AVATAR_URL } from '@/constants';
import { useEffect, useState } from 'react';

export type DoctorTeamAvatarItem = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AvatarTier = 'user' | 'default' | 'initials';

type DoctorAvatarImageProps = {
  avatarUrl: string | null | undefined;
  name: string;
  className: string;
  initialsClassName: string;
  alt?: string;
};

function DoctorAvatarImage({ avatarUrl, name, className, initialsClassName, alt = '' }: DoctorAvatarImageProps) {
  const userSrc = avatarUrl?.trim() ?? '';
  const [tier, setTier] = useState<AvatarTier>(() => (userSrc ? 'user' : 'default'));

  useEffect(() => {
    setTier(userSrc ? 'user' : 'default');
  }, [userSrc]);

  const src = tier === 'user' ? userSrc : tier === 'default' ? DEFAULT_AVATAR_URL : null;

  return (
    <div className={className}>
      {src ? (
        <img
          alt={alt}
          className="h-full w-full object-cover"
          src={src}
          onError={() => {
            setTier((prev) => {
              if (prev === 'user') return 'default';
              return 'initials';
            });
          }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center px-1">
          <span className={initialsClassName}>{initialsFromName(name)}</span>
        </div>
      )}
    </div>
  );
}

function DoctorAvatarDisc({ avatarUrl, name }: { avatarUrl: string | null | undefined; name: string }) {
  return (
    <DoctorAvatarImage
      alt=""
      avatarUrl={avatarUrl}
      name={name}
      className="relative h-[82%] w-[82%] overflow-hidden rounded-full bg-linear-to-br from-slate-100 via-slate-200 to-slate-100"
      initialsClassName="text-center text-sm font-bold leading-tight text-slate-500 md:text-base"
    />
  );
}

/** Ảnh lớn bên cạnh block giới thiệu bác sĩ (trang chủ). */
export function DoctorTeamFeaturedPhoto({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  return (
    <DoctorAvatarImage
      alt={name}
      avatarUrl={avatarUrl}
      name={name}
      className="m-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] overflow-hidden rounded-[24px] border border-slate-200 bg-linear-to-br from-slate-100 via-slate-200 to-slate-100"
      initialsClassName="text-center text-lg font-bold text-slate-500 md:text-xl"
    />
  );
}

type DoctorTeamAvatarGridProps = {
  items: DoctorTeamAvatarItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function DoctorTeamAvatarGrid({ items, activeIndex, onSelect }: DoctorTeamAvatarGridProps) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((doctor, index) => {
        const isActive = index === activeIndex;
        return (
          <button className="group text-center" key={doctor.id} onClick={() => onSelect(index)} type="button">
            <div
              className={`mx-auto grid h-[190px] w-[190px] place-items-center rounded-full border bg-white transition md:h-[230px] md:w-[230px] ${
                isActive
                  ? 'border-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.08)]'
                  : 'border-slate-300 group-hover:border-blue-300'
              }`}
            >
              <DoctorAvatarDisc avatarUrl={doctor.avatarUrl} name={doctor.name} />
            </div>

            <p className="mt-4 text-base text-slate-600">{doctor.role}</p>
            <p className={`text-xl font-bold ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{doctor.name}</p>
          </button>
        );
      })}
    </div>
  );
}
