import { App } from '@/app/App';
import { ROUTES } from '@/constants/routes';
import featureRoutes from '@/modules';
import { AboutFacilitiesPage } from '@/pages/CoSoVatChatPage';
import { RegisterPage } from '@/pages/DangKyPage';
import { LoginPage } from '@/pages/DangNhapPage';
import { AboutTeamPage } from '@/pages/DoiNguBacSiPage';
import { PricePorcelainPage } from '@/pages/GiaBocRangSuPage';
import { PriceBracesPage } from '@/pages/GiaNiengRangPage';
import { PriceImplantPage } from '@/pages/GiaTrongRangImplantPage';
import { NotFoundPage } from '@/pages/KhongTimThayPage';
import { KnowledgeImplantPage } from '@/pages/KienThucImplantPage';
import { KnowledgeBracesPage } from '@/pages/KienThucNiengRangPage';
import { KnowledgePorcelainPage } from '@/pages/KienThucRangSuPage';
import { HomePage } from '@/pages/TrangChuPage';
import { AboutRecruitmentPage } from '@/pages/TuyenDungPage';
import { AboutPage } from '@/pages/VeTamDucSmilePage';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  ...featureRoutes,
  {
    path: ROUTES.home,
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.about,
        element: <AboutPage />,
      },
      {
        path: ROUTES.aboutTeam,
        element: <AboutTeamPage />,
      },
      {
        path: ROUTES.aboutFacilities,
        element: <AboutFacilitiesPage />,
      },
      {
        path: ROUTES.aboutRecruitment,
        element: <AboutRecruitmentPage />,
      },
      {
        path: ROUTES.priceImplant,
        element: <PriceImplantPage />,
      },
      {
        path: ROUTES.priceBraces,
        element: <PriceBracesPage />,
      },
      {
        path: ROUTES.pricePorcelain,
        element: <PricePorcelainPage />,
      },
      {
        path: ROUTES.knowledgeImplant,
        element: <KnowledgeImplantPage />,
      },
      {
        path: ROUTES.knowledgeBraces,
        element: <KnowledgeBracesPage />,
      },
      {
        path: ROUTES.knowledgePorcelain,
        element: <KnowledgePorcelainPage />,
      },
      {
        path: ROUTES.login,
        element: <LoginPage />,
      },
      {
        path: ROUTES.register,
        element: <RegisterPage />,
      },
    ],
  },
]);
