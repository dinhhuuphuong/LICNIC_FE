const STORAGE_KEY = 'clinic-service-booking-draft';

export type ServiceBookingDraft = {
  serviceId: number;
  workDate?: string;
  appointmentTime?: string;
  scheduleId?: number;
  doctorId?: number;
};

export function loadServiceBookingDraft(serviceId: number): ServiceBookingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ServiceBookingDraft;
    if (parsed?.serviceId !== serviceId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveServiceBookingDraft(draft: ServiceBookingDraft): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearServiceBookingDraft(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
