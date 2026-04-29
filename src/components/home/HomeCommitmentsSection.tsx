type CommitmentItem = {
  icon: string;
  title: string;
  description: string;
};

type HomeCommitmentsSectionProps = {
  isVi: boolean;
  commitments: CommitmentItem[];
};

export function HomeCommitmentsSection({ isVi, commitments }: HomeCommitmentsSectionProps) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
      <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
        {isVi ? 'Cam kết của Nha Khoa Tâm Đức Smile' : 'Tam Duc Smile Commitments'}
      </h2>
      <p className="mx-auto mt-4 max-w-6xl text-center text-base leading-8 text-slate-700 md:text-lg">
        {isVi
          ? 'Tâm Đức Smile cam kết mang đến nụ cười rạng rỡ và trải nghiệm điều trị chất lượng cao, tận tâm, chuyên nghiệp. Sức khỏe răng miệng của Quý khách là ưu tiên hàng đầu, với dịch vụ vượt trội, an toàn, cùng sự hài lòng tối đa.'
          : 'Tam Duc Smile is committed to delivering excellent dental care with dedication, professionalism, safety, and the highest level of patient satisfaction.'}
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {commitments.map((item) => (
          <article key={item.title} className="flex h-full flex-col">
            <div className="flex h-16 items-center">
              <img alt={item.title} className="h-16 w-16 object-contain" src={item.icon} />
            </div>
            <h3 className="mt-5 min-h-18 text-2xl font-black uppercase leading-tight text-blue-700">{item.title}</h3>
            <p className="mt-3 text-base leading-8 text-slate-700 md:text-lg">{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
