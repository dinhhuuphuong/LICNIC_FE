import { ROUTES } from '@/constants/routes';
import { RouteObject } from 'react-router-dom';
import BlogPostsManage from './features/blog-posts/pages/Manage';
import Dashboard from './features/dashboard/pages/Dashboard';
import DoctorWorkSchedulesManage from './features/doctor-work-schedules/pages/Manage';
import DoctorsManage from './features/doctors/pages/Manage';
import PaymentDiscountsManage from './features/payment-discounts/pages/Manage';
import ServiceCategoriesManage from './features/service-categories/pages/Manage';
import ServicesManage from './features/services/pages/Manage';
import Manage from './features/users/pages/Manage';

const adminRoutes: RouteObject[] = [
  {
    index: true,
    element: <Dashboard />,
  },
  {
    path: ROUTES.adminUsers,
    element: <Manage />,
  },
  {
    path: ROUTES.adminDoctors,
    element: <DoctorsManage />,
  },
  {
    path: ROUTES.adminDoctorWorkSchedules,
    element: <DoctorWorkSchedulesManage />,
  },
  {
    path: ROUTES.adminServices,
    element: <ServicesManage />,
  },
  {
    path: ROUTES.adminServiceCategories,
    element: <ServiceCategoriesManage />,
  },
  {
    path: ROUTES.adminPaymentDiscounts,
    element: <PaymentDiscountsManage />,
  },
  {
    path: ROUTES.adminBlogPosts,
    element: <BlogPostsManage />,
  },
];

export default adminRoutes;
