import { DoctorTeamAvatarGrid, DoctorTeamFeaturedPhoto } from '@/components/DoctorTeamAvatarGrid';

type ActiveDoctorItem = {
  role: string;
  name: string;
  summary: string[];
  cta: string;
  avatar: string | null;
};

type AvatarItem = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
};

type HomeDoctorsSectionProps = {
  isVi: boolean;
  doctorsLoading: boolean;
  doctorsError: string | null;
  activeDoctor: ActiveDoctorItem | undefined;
  activeDoctorIndex: number;
  avatarItems: AvatarItem[];
  onSelectDoctor: (index: number) => void;
};

export function HomeDoctorsSection({
  isVi,
  doctorsLoading,
  doctorsError,
  activeDoctor,
  activeDoctorIndex,
  avatarItems,
  onSelectDoctor,
}: HomeDoctorsSectionProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Đội ngũ bác sĩ' : 'Doctor Team'}
      </h2>

      {doctorsLoading ? (
        <p className="mt-8 text-center text-base text-slate-600">
          {isVi ? 'Đang tải đội ngũ bác sĩ...' : 'Loading doctor team...'}
        </p>
      ) : doctorsError ? (
        <p className="mt-8 text-center text-base text-red-600">{doctorsError}</p>
      ) : !activeDoctor ? (
        <p className="mt-8 text-center text-base text-slate-600">
          {isVi ? 'Hiện chưa có dữ liệu bác sĩ.' : 'No doctor profiles available yet.'}
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
            <div>
              <div className="inline-block rounded-md bg-white px-4 py-3">
                <h3 className="text-2xl font-black text-blue-700 md:text-3xl">
                  {activeDoctor.role} - {activeDoctor.name}
                </h3>
              </div>

              <ul className="mt-5 space-y-3 text-base leading-7 text-slate-700">
                {activeDoctor.summary.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span>-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                className="mt-6 inline-flex items-center rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white! transition hover:bg-blue-800"
                type="button"
              >
                {activeDoctor.cta}
              </button>
            </div>

            <div className="mx-auto w-full max-w-[340px]">
              <div className="grid h-[380px] place-items-center overflow-hidden rounded-[28px] border border-blue-200 bg-white shadow-sm md:h-[430px]">
                <DoctorTeamFeaturedPhoto avatarUrl={activeDoctor.avatar} name={activeDoctor.name} />
              </div>
            </div>
          </div>

          <DoctorTeamAvatarGrid activeIndex={activeDoctorIndex} items={avatarItems} onSelect={onSelectDoctor} />
        </>
      )}
    </div>
  );
}
