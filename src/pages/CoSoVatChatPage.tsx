import bannerDatLich from '@/assets/images/banner-datlich.jpg';
import ctConeBeamImage from '@/assets/images/technology/CTConeBeam3D/may-ct-cone-beam-3d-1.png';
import iteroImage from '@/assets/images/technology/iTeroElement5D/may-clincheck-iTero-Element-5D-1.png';
import osstemChairImage from '@/assets/images/technology/OsstemCaoCap/ghe-nha-khoa-cao-cap-1.png';
import scalerImage from '@/assets/images/technology/CaoVoiRangSieuAm/may-cao-voi-rang-sieu-am-1.png';
import veChungToi from '@/assets/images/ve-chung-toi.webp';
import { SectionTitle } from '@/components/common/SectionTitle';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type FacilityCard = {
  title: string;
  description: string;
  image: string;
};

export function AboutFacilitiesPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Cơ sở vật chất' : 'NHA KHOA TẬN TÂM | Facilities');

  const facilities: FacilityCard[] = isVi
    ? [
        {
          title: 'Khu vực tiếp đón',
          description: 'Không gian đón khách sáng, sạch và thuận tiện để hỗ trợ tư vấn, xác nhận lịch hẹn.',
          image: bannerDatLich,
        },
        {
          title: 'Phòng điều trị tiêu chuẩn',
          description: 'Ghế nha khoa cao cấp hỗ trợ thao tác chính xác và tạo cảm giác thoải mái trong quá trình điều trị.',
          image: osstemChairImage,
        },
        {
          title: 'Khu chẩn đoán hình ảnh',
          description: 'Hệ thống CT Cone Beam 3D giúp bác sĩ đánh giá cấu trúc xương hàm, chân răng và lập kế hoạch điều trị.',
          image: ctConeBeamImage,
        },
        {
          title: 'Thiết bị scan kỹ thuật số',
          description: 'Máy iTero Element 5D hỗ trợ lấy dấu kỹ thuật số, mô phỏng điều trị và lưu trữ hồ sơ chính xác.',
          image: iteroImage,
        },
        {
          title: 'Thiết bị vệ sinh răng miệng',
          description: 'Máy cạo vôi siêu âm giúp làm sạch mảng bám hiệu quả, nhẹ nhàng với nướu nhạy cảm.',
          image: scalerImage,
        },
        {
          title: 'Không gian tư vấn',
          description: 'Khu vực trao đổi kế hoạch điều trị rõ ràng, minh bạch chi phí và hướng chăm sóc sau điều trị.',
          image: veChungToi,
        },
      ]
    : [
        {
          title: 'Reception Area',
          description: 'A bright and clean reception space for consultation support and appointment confirmation.',
          image: bannerDatLich,
        },
        {
          title: 'Treatment Room',
          description: 'Premium dental chairs support precise workflows and patient comfort during treatment.',
          image: osstemChairImage,
        },
        {
          title: 'Imaging Area',
          description: 'CT Cone Beam 3D helps doctors assess jawbone, roots, and treatment planning more accurately.',
          image: ctConeBeamImage,
        },
        {
          title: 'Digital Scan Equipment',
          description: 'iTero Element 5D supports digital impressions, treatment simulation, and accurate records.',
          image: iteroImage,
        },
        {
          title: 'Oral Hygiene Equipment',
          description: 'Ultrasonic scaling equipment removes plaque effectively while remaining gentle on sensitive gums.',
          image: scalerImage,
        },
        {
          title: 'Consultation Space',
          description: 'A dedicated area for clear treatment plans, transparent costs, and aftercare guidance.',
          image: veChungToi,
        },
      ];

  const standards = isVi
    ? ['Quy trình vô khuẩn theo từng bước', 'Thiết bị được kiểm tra định kỳ', 'Không gian điều trị riêng tư', 'Hồ sơ và hình ảnh được lưu trữ rõ ràng']
    : ['Step-by-step sterilization workflow', 'Regular equipment inspection', 'Private treatment environment', 'Clear record and imaging storage'];

  return (
    <section className="space-y-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/80 backdrop-blur md:p-8">
      <SectionTitle
        eyebrow={isVi ? 'Giới thiệu' : 'About'}
        title={isVi ? 'Cơ sở vật chất' : 'Facilities'}
        description={
          isVi
            ? 'Khám phá không gian phòng khám, hệ thống máy móc hiện đại và tiêu chuẩn vô trùng tại Nha Khoa Tận Tâm.'
            : 'Discover our clinic space, modern equipment, and sterilization standards at Tan Tam Dental Clinic.'
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <img
            alt={isVi ? 'Không gian cơ sở vật chất Nha Khoa Tận Tâm' : 'Tan Tam Dental Clinic facilities'}
            className="h-full min-h-[320px] w-full object-cover"
            src={osstemChairImage}
          />
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-700 p-6 text-white shadow-sm">
          <h3 className="text-3xl font-black">{isVi ? 'Không gian điều trị hiện đại' : 'Modern Treatment Space'}</h3>
          <p className="mt-4 text-base leading-8 text-blue-50">
            {isVi
              ? 'Các khu vực khám, chẩn đoán và điều trị được bố trí rõ ràng để hỗ trợ bác sĩ thao tác hiệu quả, đồng thời giúp khách hàng an tâm trong suốt quá trình chăm sóc răng miệng.'
              : 'Examination, diagnostic, and treatment areas are organized clearly to support efficient clinical workflows and help patients feel reassured throughout care.'}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {standards.map((standard) => (
              <div key={standard} className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm font-semibold text-white">
                {standard}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
          >
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                src={item.image}
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
