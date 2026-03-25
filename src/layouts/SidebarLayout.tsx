import { ROUTES } from '@/constants/routes';
import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, Result } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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

  const selectedKey = location.pathname.startsWith(ROUTES.adminUsers) ? ROUTES.adminUsers : ROUTES.admin;

  const items: MenuProps['items'] = [
    {
      key: ROUTES.admin,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: ROUTES.adminUsers,
      icon: <UserOutlined />,
      label: 'Người dùng',
    },
  ];

  if (roles && !roles.includes(user?.role?.roleName ?? ''))
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={<Button type="primary">Back Home</Button>}
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
        className="bg-[#001529] overflow-hidden flex flex-col z-10"
      >
        <div className="h-16 flex items-center px-4 border-b border-white/10 text-black/90 font-bold tracking-[0.2px]">
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
