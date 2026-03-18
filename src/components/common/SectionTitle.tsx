type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">{eyebrow}</p> : null}
      <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-slate-600 md:text-lg">{description}</p> : null}
    </div>
  );
}
