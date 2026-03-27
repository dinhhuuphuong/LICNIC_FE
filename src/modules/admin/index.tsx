import { ROUTES } from '@/constants/routes';
import { RouteObject } from 'react-router-dom';
import Dashboard from './features/dashboard/pages/Dashboard';
import ServiceCategoriesManage from './features/service-categories/pages/Manage';
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
    path: ROUTES.adminServiceCategories,
    element: <ServiceCategoriesManage />,
  },
];

export default adminRoutes;
