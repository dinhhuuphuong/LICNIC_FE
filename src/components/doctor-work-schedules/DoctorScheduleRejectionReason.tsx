type DoctorScheduleRejectionReasonProps = {
  isVi: boolean;
  rejectionReason?: string | null;
  className?: string;
};

export function DoctorScheduleRejectionReason(props: DoctorScheduleRejectionReasonProps) {
  const { isVi, rejectionReason, className } = props;
  if (!rejectionReason) return null;

  return (
    <div className={className ?? 'mt-1 text-xs text-red-700'}>
      <span className="font-semibold">{isVi ? 'Lý do từ chối:' : 'Rejection reason:'}</span> {rejectionReason}
    </div>
  );
}
