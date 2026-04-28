export const ROUTES = {
  home: '/',
  about: '/gioi-thieu/ve-tam-duc-smile',
  aboutTeam: '/gioi-thieu/doi-ngu-bac-si',
  doctorPublicDetail: '/gioi-thieu/doi-ngu-bac-si/:doctorId',
  aboutFacilities: '/gioi-thieu/co-so-vat-chat',
  aboutRecruitment: '/gioi-thieu/tuyen-dung',
  priceImplant: '/bang-gia/gia-trong-rang-implant',
  priceBraces: '/bang-gia/gia-nieng-rang',
  pricePorcelain: '/bang-gia/gia-boc-rang-su',
  knowledgeImplant: '/kien-thuc/kien-thuc-implant',
  knowledgeBraces: '/kien-thuc/kien-thuc-nieng-rang',
  knowledgePorcelain: '/kien-thuc/kien-thuc-rang-su',
  login: '/dang-nhap',
  register: '/dang-ky',
  patientProfile: '/benh-nhan/ho-so',
  patientAppointments: '/benh-nhan/lich-hen',
  patientAppointmentDetail: '/benh-nhan/lich-hen/:appointmentId',
  patientMedicalRecords: '/benh-nhan/benh-an',
  doctorProfile: '/bac-si/thong-tin-ca-nhan',
  doctorDashboard: '/bac-si/dashboard',
  doctorWorkSchedules: '/bac-si/lich-lam-viec',
  doctorWorkSchedulesCreate: '/bac-si/lich-lam-viec/tao-moi',
  doctorAppointments: '/bac-si/quan-ly-dat-lich',
  doctorMedicalRecordsManage: '/bac-si/benh-an/quan-ly',
  doctorMedicalRecordCreate: '/bac-si/benh-an/tao-moi',
  receptionistAppointments: '/le-tan/quan-ly-dat-lich',
  receptionistCustomerCare: '/le-tan/cham-soc-khach-hang',
  receptionistPaymentsManage: '/le-tan/quan-ly-thanh-toan',
  receptionistPaymentCreate: '/le-tan/thanh-toan',
  receptionistPaymentDetail: '/le-tan/thanh-toan/:paymentId',
  /** Chi tiết bệnh án — dùng `getPatientMedicalRecordDetailRoute(recordId)`. */
  patientMedicalRecordDetail: '/benh-nhan/benh-an/:recordId',
  /** Chi tiết dịch vụ — dùng `getServiceDetailRoute(id)` cho `Link`/`navigate` */
  serviceDetail: '/dich-vu/:serviceId',
  /** Đặt lịch theo dịch vụ — dùng `getServiceBookingRoute(id)` */
  serviceBooking: '/dich-vu/:serviceId/dat-lich',

  // admin routes
  admin: '/admin',
  adminUsers: '/admin/users',
  adminDoctors: '/admin/doctors',
  adminDoctorWorkSchedules: '/admin/doctor-work-schedules',
  adminServices: '/admin/services',
  adminServiceCategories: '/admin/service-categories',
  adminPaymentDiscounts: '/admin/payment-discounts',
  adminBlogPosts: '/admin/blog-posts',
} as const;

export function getServiceDetailRoute(serviceId: number) {
  return `/dich-vu/${serviceId}`;
}

export function getDoctorPublicDetailRoute(doctorId: number) {
  return `/gioi-thieu/doi-ngu-bac-si/${doctorId}`;
}

export function getServiceBookingRoute(serviceId: number) {
  return `/dich-vu/${serviceId}/dat-lich`;
}

export function getPatientMedicalRecordDetailRoute(recordId: number) {
  return `/benh-nhan/benh-an/${recordId}`;
}

export function getPatientAppointmentDetailRoute(appointmentId: number) {
  return `/benh-nhan/lich-hen/${appointmentId}`;
}

export function getReceptionistPaymentDetailRoute(paymentId: number) {
  return `/le-tan/thanh-toan/${paymentId}`;
}
