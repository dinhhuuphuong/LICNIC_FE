import { ROUTES } from '@/constants/routes';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, Result } from 'antd';
import {
  BadgePercent,
  BriefcaseMedical,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListTree,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLanguage } from '@/contexts/NgonNguContext';
import { useAuthStore } from '@/stores/authStore';
import 'antd/dist/reset.css';

interface SidebarLayoutProps {
  roles?: string[];
}

const { Sider, Content } = Layout;

const SidebarLayout = (props: SidebarLayoutProps) => {
  const { roles } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuthStore();

  let selectedKey: string = ROUTES.admin;
  if (location.pathname.startsWith(ROUTES.adminUsers)) {
    selectedKey = ROUTES.adminUsers;
  } else if (location.pathname.startsWith(ROUTES.adminDoctors)) {
    selectedKey = ROUTES.adminDoctors;
  } else if (location.pathname.startsWith(ROUTES.adminDoctorWorkSchedules)) {
    selectedKey = ROUTES.adminDoctorWorkSchedules;
  } else if (location.pathname.startsWith(ROUTES.adminServiceCategories)) {
    selectedKey = ROUTES.adminServiceCategories;
  } else if (location.pathname.startsWith(ROUTES.adminServices)) {
    selectedKey = ROUTES.adminServices;
  } else if (location.pathname.startsWith(ROUTES.adminPaymentDiscounts)) {
    selectedKey = ROUTES.adminPaymentDiscounts;
  } else if (location.pathname.startsWith(ROUTES.adminBlogPosts)) {
    selectedKey = ROUTES.adminBlogPosts;
  }

  const { language } = useLanguage();
  const isVi = language === 'vi';

  const subTitle = isVi
    ? 'Xin lỗi, bạn không có quyền truy cập trang này.'
    : 'Sorry, you are not authorized to access this page.';
  const buttonText = isVi ? 'Quay về trang chủ' : 'Back Home';

  const items: MenuProps['items'] = [
    {
      key: ROUTES.admin,
      icon: <LayoutDashboard size={16} />,
      label: 'Dashboard',
    },
    {
      key: ROUTES.adminUsers,
      icon: <Users size={16} />,
      label: 'Người dùng',
    },
    {
      key: ROUTES.adminDoctors,
      icon: <Stethoscope size={16} />,
      label: 'Bác sĩ',
    },
    {
      key: ROUTES.adminDoctorWorkSchedules,
      icon: <CalendarDays size={16} />,
      label: 'Lịch làm việc',
    },
    {
      key: ROUTES.adminServices,
      icon: <BriefcaseMedical size={16} />,
      label: 'Dịch vụ',
    },
    {
      key: ROUTES.adminServiceCategories,
      icon: <ListTree size={16} />,
      label: 'Danh mục dịch vụ',
    },
    {
      key: ROUTES.adminPaymentDiscounts,
      icon: <BadgePercent size={16} />,
      label: 'Ưu đãi thanh toán',
    },
    {
      key: ROUTES.adminBlogPosts,
      icon: <FileText size={16} />,
      label: 'Bài viết',
    },
  ];

  const handleToHome = () => {
    navigate(ROUTES.home);
  };

  if (roles && !roles.includes(user?.role?.roleName ?? ''))
    return (
      <Result
        status="403"
        title="403"
        subTitle={subTitle}
        extra={
          <Button type="primary" onClick={handleToHome}>
            {buttonText}
          </Button>
        }
      />
    );

  return (
    <Layout className="min-h-screen! flex">
      <Sider
        width={240}
        collapsible
        breakpoint="lg"
        theme="light"
        style={{ position: 'sticky', top: 0, height: '100vh' }}
        className="overflow-hidden flex flex-col z-10"
      >
        <div
          className="h-16 flex items-center px-4 border-b border-white/10 text-black/90 font-bold tracking-[0.2px] cursor-pointer"
          onClick={handleToHome}
        >
          Clinic Admin
        </div>

        <div className="flex-1 overflow-y-auto">
          <Menu
            theme="light"
            mode="inline"
            items={items}
            selectedKeys={[selectedKey]}
            onClick={(e) => navigate(String(e.key))}
          />
        </div>
      </Sider>

      <Layout className="bg-transparent flex flex-col flex-1">
        <Content className="m-4 pt-0">
          <div className="bg-white rounded-lg p-4 min-h-[calc(100vh-32px)]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SidebarLayout;
