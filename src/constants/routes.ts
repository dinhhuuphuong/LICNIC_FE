export const ROUTES = {
  home: '/',
  about: '/gioi-thieu/ve-tam-duc-smile',
  aboutTeam: '/gioi-thieu/doi-ngu-bac-si',
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

export function getServiceBookingRoute(serviceId: number) {
  return `/dich-vu/${serviceId}/dat-lich`;
}
