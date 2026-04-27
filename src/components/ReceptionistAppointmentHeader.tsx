type ReceptionistAppointmentHeaderProps = {
  isVi: boolean;
};

export function ReceptionistAppointmentHeader({ isVi }: ReceptionistAppointmentHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-black text-slate-900">{isVi ? 'Quản lý đặt lịch' : 'Appointment management'}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVi ? 'Danh sách lịch khách hàng đã đặt.' : 'List of customer appointments.'}
      </p>
    </header>
  );
}
