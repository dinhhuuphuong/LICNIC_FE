import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import SidebarLayout from '@/layouts/SidebarLayout';
import { NotFoundPage } from '@/pages/KhongTimThayPage';
import { RouteObject } from 'react-router-dom';
import adminRoutes from './admin';

const featureRoutes: RouteObject[] = [
  {
    path: ROUTES.admin,
    element: <SidebarLayout roles={[ROLE.ADMIN]} />,
    errorElement: <NotFoundPage />,
    children: adminRoutes,
  },
];

export default featureRoutes;
