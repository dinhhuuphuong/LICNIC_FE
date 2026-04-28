import { http, type Response } from '@/services/http';

export type AppointmentGroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type AppointmentGroupedItem = {
  period: string;
  appointmentCount: number;
};

export type AppointmentGroupedStatsData = {
  items: AppointmentGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetAppointmentsGroupedResponse = Response<AppointmentGroupedStatsData>;

export type GetAppointmentsGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: AppointmentGroupBy;
  page?: number;
  limit?: number;
};

const STATISTICS_URL = '/statistics';

export function getAppointmentsGrouped(params: GetAppointmentsGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'day';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetAppointmentsGroupedResponse>(`${STATISTICS_URL}/appointments-grouped?${queryParams.toString()}`);
}

export type RevenueGroupedItem = {
  period: string;
  revenue: number;
};

export type RevenueGroupedStatsData = {
  items: RevenueGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetRevenueGroupedResponse = Response<RevenueGroupedStatsData>;

export type GetRevenueGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: AppointmentGroupBy;
  page?: number;
  limit?: number;
};

export function getRevenueGrouped(params: GetRevenueGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'day';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetRevenueGroupedResponse>(`${STATISTICS_URL}/revenue-grouped?${queryParams.toString()}`);
}

export type RevenueByDoctorGroupedItem = {
  period: string;
  revenue: number;
  doctorId: number;
  doctorName: string;
};

export type RevenueByDoctorGroupedStatsData = {
  items: RevenueByDoctorGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetRevenueByDoctorGroupedResponse = Response<RevenueByDoctorGroupedStatsData>;

export type GetRevenueByDoctorGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: AppointmentGroupBy;
  page?: number;
  limit?: number;
};

export function getRevenueByDoctorGrouped(params: GetRevenueByDoctorGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'day';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetRevenueByDoctorGroupedResponse>(
    `${STATISTICS_URL}/revenue-by-doctor-grouped?${queryParams.toString()}`,
  );
}

export type TopServiceByAppointmentsGroupedItem = {
  period: string;
  serviceId: number;
  serviceName: string;
  appointmentCount: number;
};

export type TopServicesByAppointmentsGroupedStatsData = {
  items: TopServiceByAppointmentsGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetTopServicesByAppointmentsGroupedResponse = Response<TopServicesByAppointmentsGroupedStatsData>;

export type GetTopServicesByAppointmentsGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: AppointmentGroupBy;
  page?: number;
  limit?: number;
};

export function getTopServicesByAppointmentsGrouped(params: GetTopServicesByAppointmentsGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'day';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetTopServicesByAppointmentsGroupedResponse>(
    `${STATISTICS_URL}/top-services-by-appointments-grouped?${queryParams.toString()}`,
  );
}

export type TopDoctorByAppointmentsGroupedItem = {
  period: string;
  doctorId: number;
  doctorName: string;
  appointmentCount: number;
};

export type TopDoctorsByAppointmentsGroupedStatsData = {
  items: TopDoctorByAppointmentsGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetTopDoctorsByAppointmentsGroupedResponse = Response<TopDoctorsByAppointmentsGroupedStatsData>;

export type GetTopDoctorsByAppointmentsGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: AppointmentGroupBy;
  page?: number;
  limit?: number;
};

export function getTopDoctorsByAppointmentsGrouped(params: GetTopDoctorsByAppointmentsGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'day';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetTopDoctorsByAppointmentsGroupedResponse>(
    `${STATISTICS_URL}/top-doctors-by-appointments-grouped?${queryParams.toString()}`,
  );
}

export type TopServiceByDoctorGroupedItem = {
  period: string;
  doctorId: number;
  serviceId: number;
  doctorName: string;
  serviceName: string;
  appointmentCount: number;
};

export type TopServicesByDoctorGroupedStatsData = {
  items: TopServiceByDoctorGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetTopServicesByDoctorGroupedResponse = Response<TopServicesByDoctorGroupedStatsData>;

export type GetTopServicesByDoctorGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: AppointmentGroupBy;
  page?: number;
  limit?: number;
};

export function getTopServicesByDoctorGrouped(params: GetTopServicesByDoctorGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'day';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetTopServicesByDoctorGroupedResponse>(
    `${STATISTICS_URL}/top-services-by-doctor-grouped?${queryParams.toString()}`,
  );
}

export type DoctorWorkDaysGroupedItem = {
  period: string;
  doctorId: number;
  doctorName: string;
  workDays: number;
};

export type DoctorWorkDaysGroupedStatsData = {
  items: DoctorWorkDaysGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetDoctorWorkDaysGroupedResponse = Response<DoctorWorkDaysGroupedStatsData>;

export type GetDoctorWorkDaysGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: Extract<AppointmentGroupBy, 'month' | 'quarter' | 'year'>;
  page?: number;
  limit?: number;
};

export function getDoctorWorkDaysGrouped(params: GetDoctorWorkDaysGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'month';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetDoctorWorkDaysGroupedResponse>(
    `${STATISTICS_URL}/doctor-work-days-grouped?${queryParams.toString()}`,
  );
}

export type ExaminedPatientsGroupedItem = {
  period: string;
  doctorId: number;
  doctorName: string;
  patientCount: number;
};

export type ExaminedPatientsGroupedStatsData = {
  items: ExaminedPatientsGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetExaminedPatientsGroupedResponse = Response<ExaminedPatientsGroupedStatsData>;

export type GetExaminedPatientsGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: Extract<AppointmentGroupBy, 'month' | 'quarter' | 'year'>;
  page?: number;
  limit?: number;
};

export function getExaminedPatientsGrouped(params: GetExaminedPatientsGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'month';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetExaminedPatientsGroupedResponse>(
    `${STATISTICS_URL}/examined-patients-grouped?${queryParams.toString()}`,
  );
}

export type PrescriptionsGroupedItem = {
  period: string;
  doctorId: number;
  doctorName: string;
  prescriptionCount: number;
};

export type PrescriptionsGroupedStatsData = {
  items: PrescriptionsGroupedItem[];
  total: number;
  page: number;
  limit: number;
  groupBy: string;
};

export type GetPrescriptionsGroupedResponse = Response<PrescriptionsGroupedStatsData>;

export type GetPrescriptionsGroupedParams = {
  fromDate?: string;
  toDate?: string;
  groupBy?: Extract<AppointmentGroupBy, 'month' | 'quarter' | 'year'>;
  page?: number;
  limit?: number;
};

export function getPrescriptionsGrouped(params: GetPrescriptionsGroupedParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 100;
  const groupBy = params.groupBy ?? 'month';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    groupBy,
  });

  if (params.fromDate) queryParams.set('fromDate', params.fromDate);
  if (params.toDate) queryParams.set('toDate', params.toDate);

  return http<GetPrescriptionsGroupedResponse>(`${STATISTICS_URL}/prescriptions-grouped?${queryParams.toString()}`);
}
