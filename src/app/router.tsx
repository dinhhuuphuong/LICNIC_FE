import { App } from '@/app/App';
import { ROUTES } from '@/constants/routes';
import featureRoutes from '@/modules';
import { BenhAnBenhNhanPage } from '@/pages/BenhAnBenhNhanPage';
import { ChamSocKhachHangLeTanPage } from '@/pages/ChamSocKhachHangLeTanPage';
import { DoctorDetailPage } from '@/pages/ChiTietBacSiPage';
import { ChiTietBenhAnBenhNhanPage } from '@/pages/ChiTietBenhAnBenhNhanPage';
import { ServiceDetailPage } from '@/pages/ChiTietDichVuPage';
import { ChiTietThanhToanLeTanPage } from '@/pages/ChiTietThanhToanLeTanPage';
import { AboutFacilitiesPage } from '@/pages/CoSoVatChatPage';
import { RegisterPage } from '@/pages/DangKyPage';
import { LoginPage } from '@/pages/DangNhapPage';
import { DatLichDichVuPage } from '@/pages/DatLichDichVuPage';
import { AboutTeamPage } from '@/pages/DoiNguBacSiPage';
import { PricePorcelainPage } from '@/pages/GiaBocRangSuPage';
import { PriceBracesPage } from '@/pages/GiaNiengRangPage';
import { PriceImplantPage } from '@/pages/GiaTrongRangImplantPage';
import { HoSoBenhNhanPage } from '@/pages/HoSoBenhNhanPage';
import { NotFoundPage } from '@/pages/KhongTimThayPage';
import { KnowledgeImplantPage } from '@/pages/KienThucImplantPage';
import { KnowledgeBracesPage } from '@/pages/KienThucNiengRangPage';
import { KnowledgePorcelainPage } from '@/pages/KienThucRangSuPage';
import { LichHenBenhNhanPage } from '@/pages/LichHenBenhNhanPage';
import QuanLyDatLichBacSiPage from '@/pages/QuanLyDatLichBacSiPage';
import { QuanLyDatLichLeTanPage } from '@/pages/QuanLyDatLichLeTanPage';
import { QuanLyHoSoBenhNhanBacSiPage } from '@/pages/QuanLyHoSoBenhNhanBacSiPage';
import { QuanLyThanhToanLeTanPage } from '@/pages/QuanLyThanhToanLeTanPage';
import { TaoBenhAnVaDonThuocPage } from '@/pages/TaoBenhAnVaDonThuocPage';
import { TaoLichLamViecBacSiPage } from '@/pages/TaoLichLamViecBacSiPage';
import { TaoThanhToanLeTanPage } from '@/pages/TaoThanhToanLeTanPage';
import { ThongTinCaNhanBacSiPage } from '@/pages/ThongTinCaNhanBacSiPage';
import { HomePage } from '@/pages/TrangChuPage';
import { AboutRecruitmentPage } from '@/pages/TuyenDungPage';
import { AboutPage } from '@/pages/VeTamDucSmilePage';
import queryString from 'query-string';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import LichLamViecBacSiPageV2 from '../pages/LichLamViecBacSiPageV2';

const queryParamsLayoutElement = (
  <QueryParamProvider
    adapter={ReactRouter6Adapter}
    options={{
      searchStringToObject: queryString.parse,
      objectToSearchString: queryString.stringify,
    }}
  >
    <Outlet />
  </QueryParamProvider>
);

export const router = createBrowserRouter([
  {
    element: queryParamsLayoutElement,
    children: [
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
            path: ROUTES.doctorPublicDetail,
            element: <DoctorDetailPage />,
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
          {
            path: ROUTES.patientProfile,
            element: <HoSoBenhNhanPage />,
          },
          {
            path: ROUTES.patientAppointments,
            element: <LichHenBenhNhanPage />,
          },
          {
            path: ROUTES.patientMedicalRecords,
            element: <BenhAnBenhNhanPage />,
          },
          {
            path: ROUTES.doctorProfile,
            element: <ThongTinCaNhanBacSiPage />,
          },
          {
            path: ROUTES.doctorWorkSchedules,
            element: <LichLamViecBacSiPageV2 />,
          },
          {
            path: ROUTES.doctorWorkSchedulesCreate,
            element: <TaoLichLamViecBacSiPage />,
          },
          {
            path: ROUTES.doctorAppointments,
            element: <QuanLyDatLichBacSiPage />,
          },
          {
            path: ROUTES.doctorMedicalRecordsManage,
            element: <QuanLyHoSoBenhNhanBacSiPage />,
          },
          {
            path: ROUTES.doctorMedicalRecordCreate,
            element: <TaoBenhAnVaDonThuocPage />,
          },
          {
            path: ROUTES.receptionistAppointments,
            element: <QuanLyDatLichLeTanPage />,
          },
          {
            path: ROUTES.receptionistCustomerCare,
            element: <ChamSocKhachHangLeTanPage />,
          },
          {
            path: ROUTES.receptionistPaymentsManage,
            element: <QuanLyThanhToanLeTanPage />,
          },
          {
            path: ROUTES.receptionistPaymentCreate,
            element: <TaoThanhToanLeTanPage />,
          },
          {
            path: ROUTES.receptionistPaymentDetail,
            element: <ChiTietThanhToanLeTanPage />,
          },
          {
            path: ROUTES.patientMedicalRecordDetail,
            element: <ChiTietBenhAnBenhNhanPage />,
          },
          {
            path: ROUTES.serviceBooking,
            element: <DatLichDichVuPage />,
          },
          {
            path: ROUTES.serviceDetail,
            element: <ServiceDetailPage />,
          },
        ],
      },
    ],
  },
]);
