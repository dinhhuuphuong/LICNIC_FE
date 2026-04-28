type PatientAppointmentReviewStarsProps = {
  rating: number;
};

export function PatientAppointmentReviewStars({ rating }: PatientAppointmentReviewStarsProps) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rounded} out of 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const active = idx < rounded;
        return (
          <svg
            key={idx}
            viewBox="0 0 20 20"
            fill={active ? 'currentColor' : 'none'}
            className={active ? 'h-4 w-4 text-amber-500' : 'h-4 w-4 text-slate-300'}
            aria-hidden="true"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.112 3.422a1 1 0 00.95.69h3.598c.969 0 1.371 1.24.588 1.81l-2.912 2.116a1 1 0 00-.364 1.118l1.112 3.422c.3.921-.755 1.688-1.539 1.118l-2.912-2.116a1 1 0 00-1.176 0L6.496 17.5c-.784.57-1.838-.197-1.539-1.118l1.112-3.422a1 1 0 00-.364-1.118L2.793 9.726c-.783-.57-.38-1.81.588-1.81h3.598a1 1 0 00.95-.69l1.12-3.299z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        );
      })}
    </div>
  );
}
