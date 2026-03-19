import bannerHome from '@/assets/images/banner.png';
import camKetChatLuong from '@/assets/images/chat-luong.svg';
import camKetChinhHang from '@/assets/images/chinh-hang.svg';
import camKetHoTro from '@/assets/images/ho-tro.svg';
import camKetMinhBach from '@/assets/images/minh-bach.svg';
import veChungToi from '@/assets/images/ve-chung-toi.webp';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ROUTES } from '@/constants/routes';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { language } = useLanguage();
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeTechIndex, setActiveTechIndex] = useState(0);
  const [activeDoctorIndex, setActiveDoctorIndex] = useState(0);
  const [activeStoryPage, setActiveStoryPage] = useState(0);
  const [activeNewsTab, setActiveNewsTab] = useState(0);

  const isVi = language === 'vi';
  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Trang chủ' : 'NHA KHOA TẬN TÂM | Home');

  const quickActions = isVi
    ? [
        { icon: '📞', title: 'Hotline Tư Vấn', description: 'Tư vấn nhanh - miễn phí' },
        { icon: '🗓️', title: 'Đặt Lịch Hẹn', description: 'Nhanh chóng, tiện lợi' },
        { icon: '🪪', title: 'Tra Cứu Bảo Hành', description: 'Thông tin nhanh, chính xác' },
      ]
    : [
        { icon: '📞', title: 'Consult Hotline', description: 'Fast and free consultation' },
        { icon: '🗓️', title: 'Book Appointment', description: 'Quick and convenient' },
        { icon: '🪪', title: 'Warranty Lookup', description: 'Fast and accurate information' },
      ];

  const reasons = isVi
    ? [
        {
          number: '01',
          title: 'Bác sĩ giỏi tận tâm',
          description:
            'Đội ngũ bác sĩ nha khoa hơn 10 năm kinh nghiệm, chuyên sâu từng lĩnh vực như niềng răng, Implant, bọc sứ, luôn tận tâm trong điều trị.',
        },
        {
          number: '02',
          title: 'Hệ thống nha khoa uy tín',
          description:
            'Nha khoa Tận Tâm có nhiều chi nhánh trên toàn quốc, giúp Quý khách dễ dàng tiếp cận dịch vụ chất lượng, thuận tiện đặt lịch.',
        },
        {
          number: '03',
          title: 'Công nghệ hiện đại',
          description:
            'Trang bị máy móc hiện đại giúp chẩn đoán chính xác, hỗ trợ điều trị không đau, nhanh lành, đảm bảo an toàn và hiệu quả lâu dài.',
        },
        {
          number: '04',
          title: 'Cam kết minh bạch',
          description:
            'Tất cả dịch vụ đều có bảng giá công khai, tư vấn rõ ràng, hợp đồng minh bạch - cam kết không phát sinh chi phí ngoài báo giá ban đầu.',
        },
        {
          number: '05',
          title: 'Hỗ trợ tài chính tốt',
          description:
            'Hỗ trợ trả góp 0%, bảo hành đến trọn đời tùy dịch vụ, thường xuyên tặng voucher - giúp Quý khách dễ dàng tiếp cận các dịch vụ cao cấp.',
        },
        {
          number: '06',
          title: 'Khách hàng tin chọn',
          description:
            '15.000+ khách hàng đã hài lòng, để lại hàng ngàn phản hồi tích cực trên Google & Facebook - khẳng định niềm tin dành cho Nha Khoa Tận Tâm.',
        },
      ]
    : [
        {
          number: '01',
          title: 'Skilled & dedicated doctors',
          description:
            'Our dental team has over 10 years of experience, with deep expertise in braces, implants, and porcelain solutions.',
        },
        {
          number: '02',
          title: 'Trusted dental system',
          description:
            'Tam Duc Smile has multiple branches nationwide, making it easier for patients to access quality care and book appointments.',
        },
        {
          number: '03',
          title: 'Modern technology',
          description:
            'Advanced equipment supports accurate diagnosis, gentle treatment, faster recovery, and long-term effectiveness.',
        },
        {
          number: '04',
          title: 'Transparent commitment',
          description:
            'All services have public pricing, clear consultation, and transparent contracts with no hidden costs beyond initial quotation.',
        },
        {
          number: '05',
          title: 'Strong financial support',
          description:
            '0% installment plans, long-term warranty, and regular vouchers help patients access high-quality dental services.',
        },
        {
          number: '06',
          title: 'Customer trust',
          description:
            '15,000+ satisfied customers and thousands of positive reviews on Google & Facebook reinforce trust in Tam Duc Smile.',
        },
      ];

  const leftReasons = reasons.slice(0, 3);
  const rightReasons = reasons.slice(3);

  const featuredServices = isVi
    ? [
        // TODO: Update `to` when real super-menu routes are confirmed.
        { eyebrow: 'Bọc răng sứ', title: 'Veneer thẩm mỹ', to: ROUTES.home },
        { eyebrow: 'Niềng răng', title: 'Chỉnh nha mắc cài', to: ROUTES.home },
        { eyebrow: 'Trồng răng', title: 'Implant toàn hàm', to: ROUTES.home },
        { eyebrow: 'Tiểu phẫu', title: 'Nhổ răng khôn', to: ROUTES.home },
        { eyebrow: 'Nha khoa thẩm mỹ', title: 'Tẩy trắng răng', to: ROUTES.home },
      ]
    : [
        // TODO: Update `to` when real super-menu routes are confirmed.
        { eyebrow: 'Porcelain crowns', title: 'Veneer esthetics', to: ROUTES.home },
        { eyebrow: 'Orthodontics', title: 'Braces treatment', to: ROUTES.home },
        { eyebrow: 'Implant', title: 'Full-arch implant', to: ROUTES.home },
        { eyebrow: 'Minor surgery', title: 'Wisdom tooth removal', to: ROUTES.home },
        { eyebrow: 'Cosmetic dentistry', title: 'Teeth whitening', to: ROUTES.home },
      ];

  const featuredServiceCount = featuredServices.length;

  const shiftFeaturedService = (step: number) => {
    setActiveServiceIndex((prev) => (prev + step + featuredServiceCount) % featuredServiceCount);
  };

  const visibleServiceIndexes = [
    (activeServiceIndex - 1 + featuredServiceCount) % featuredServiceCount,
    activeServiceIndex,
    (activeServiceIndex + 1) % featuredServiceCount,
  ];

  const modernTechnologies = isVi
    ? [
        {
          tabLabel: 'Máy iTero Element 5D',
          title: 'Máy iTero Element 5D',
          lead: 'Thiết bị scan kỹ thuật số hiện đại, hỗ trợ chẩn đoán và lập kế hoạch chỉnh nha chính xác.',
          paragraphs: [
            'iTero Element 5D giúp quét toàn bộ khoang miệng trong thời gian ngắn, hiển thị mô phỏng 3D trực quan và giảm đáng kể sai số so với lấy dấu truyền thống.',
            'Trong lần khám đầu tiên, bác sĩ có thể phân tích cấu trúc răng - hàm, tư vấn lộ trình điều trị rõ ràng và giúp khách hàng dễ hình dung kết quả.',
          ],
          highlightsTitle: 'Điểm nổi bật',
          highlights: [
            'Công nghệ NIRI hỗ trợ phát hiện tổn thương men răng sớm.',
            'Mô phỏng dịch chuyển răng trước khi điều trị.',
            'Lưu trữ hồ sơ scan số hóa, dễ theo dõi tiến triển.',
          ],
          thumbnails: ['Tổng quan máy', 'Bác sĩ thao tác', 'Màn hình mô phỏng', 'Đầu quét 5D', 'Ca lâm sàng'],
        },
        {
          tabLabel: 'Máy CT Cone Beam 3D',
          title: 'Máy CT Cone Beam 3D',
          lead: 'Hệ thống chụp phim 3D độ phân giải cao, hỗ trợ đánh giá cấu trúc xương hàm và chân răng chính xác.',
          paragraphs: [
            'Cone Beam 3D giúp bác sĩ quan sát rõ hệ thống thần kinh, xoang hàm, mật độ xương và vị trí răng ngầm trước khi can thiệp.',
            'Thông tin hình ảnh hỗ trợ lập kế hoạch cấy Implant, nhổ răng khôn và phẫu thuật với độ an toàn cao.',
          ],
          highlightsTitle: 'Điểm nổi bật',
          highlights: [
            'Hình ảnh 3 chiều chi tiết theo từng lát cắt.',
            'Giảm thiểu rủi ro khi điều trị xâm lấn.',
            'Rút ngắn thời gian chẩn đoán và lập kế hoạch.',
          ],
          thumbnails: ['Máy CT', 'Quy trình chụp', 'Kết quả phim', 'Phân tích 3D', 'Ứng dụng Implant'],
        },
        {
          tabLabel: 'Máy Cạo Vôi Răng Siêu Âm',
          title: 'Máy Cạo Vôi Răng Siêu Âm',
          lead: 'Công nghệ rung siêu âm giúp làm sạch mảng bám và cao răng hiệu quả mà vẫn êm ái.',
          paragraphs: [
            'Thiết bị tạo dao động tần số cao, bóc tách cao răng bám chắc quanh cổ răng và dưới nướu mà hạn chế khó chịu.',
            'Kết hợp đầu tip chuyên dụng giúp giảm ê buốt, hỗ trợ nướu phục hồi nhanh và cải thiện hơi thở rõ rệt.',
          ],
          highlightsTitle: 'Điểm nổi bật',
          highlights: [
            'Làm sạch sâu nhưng nhẹ nhàng với nướu nhạy cảm.',
            'Rút ngắn thời gian vệ sinh răng định kỳ.',
            'Giảm nguy cơ viêm nướu và chảy máu chân răng.',
          ],
          thumbnails: ['Thiết bị siêu âm', 'Đầu tip chuyên dụng', 'Làm sạch nướu', 'Trước điều trị', 'Sau điều trị'],
        },
        {
          tabLabel: 'Ghế Osstem Cao Cấp',
          title: 'Ghế Osstem Cao Cấp',
          lead: 'Ghế nha khoa tiêu chuẩn cao cấp, tối ưu tư thế cho bác sĩ và tăng sự thoải mái cho khách hàng.',
          paragraphs: [
            'Hệ thống điều khiển điện tử mượt, tích hợp đèn LED vùng miệng và cụm tay khoan giúp thao tác chính xác, tiết kiệm thời gian.',
            'Không gian điều trị được thiết kế theo tiêu chuẩn vô khuẩn, hỗ trợ quy trình chăm sóc an toàn và chuyên nghiệp.',
          ],
          highlightsTitle: 'Điểm nổi bật',
          highlights: [
            'Điều chỉnh linh hoạt nhiều tư thế khi điều trị.',
            'Tăng trải nghiệm thoải mái trong phiên điều trị dài.',
            'Tích hợp hệ thống hỗ trợ thao tác hiệu quả.',
          ],
          thumbnails: ['Ghế điều trị', 'Khu vực điều khiển', 'Đèn chiếu sáng', 'Không gian phòng', 'Thiết kế vô khuẩn'],
        },
      ]
    : [
        {
          tabLabel: 'iTero Element 5D',
          title: 'iTero Element 5D',
          lead: 'Modern digital scanner for accurate diagnosis and orthodontic planning.',
          paragraphs: [
            'iTero captures full-mouth scans quickly with realistic 3D visualization, replacing uncomfortable traditional impressions.',
            'Doctors can present treatment simulation in the first consultation, helping patients understand expected outcomes better.',
          ],
          highlightsTitle: 'Highlights',
          highlights: [
            'NIRI technology for early enamel issue detection.',
            'Pre-treatment tooth movement simulation.',
            'Digital records for long-term progress tracking.',
          ],
          thumbnails: ['Machine overview', 'Doctor workflow', 'Simulation screen', 'Scanner tip', 'Clinical case'],
        },
        {
          tabLabel: 'CT Cone Beam 3D',
          title: 'CT Cone Beam 3D',
          lead: 'High-resolution 3D imaging system for jawbone and root structure assessment.',
          paragraphs: [
            'Cone Beam allows clear visualization of nerves, sinus area, bone density, and impacted teeth before interventions.',
            'It provides important data for implant planning, wisdom tooth extraction, and safer surgical decisions.',
          ],
          highlightsTitle: 'Highlights',
          highlights: [
            'Detailed three-dimensional diagnostic slices.',
            'Lower risk in invasive procedures.',
            'Faster diagnosis and treatment planning.',
          ],
          thumbnails: ['CT machine', 'Scanning process', 'Image output', '3D analysis', 'Implant use case'],
        },
        {
          tabLabel: 'Ultrasonic Scaler',
          title: 'Ultrasonic Scaler',
          lead: 'Ultrasonic vibration technology for effective and gentle tartar removal.',
          paragraphs: [
            'The system removes stubborn plaque and tartar around gum lines while minimizing discomfort during cleaning.',
            'Specialized tips reduce sensitivity and support quicker gum recovery after routine hygiene sessions.',
          ],
          highlightsTitle: 'Highlights',
          highlights: [
            'Deep cleaning with gentle gum protection.',
            'Faster routine hygiene appointments.',
            'Reduced risk of gingivitis and bleeding gums.',
          ],
          thumbnails: ['Ultrasonic unit', 'Specialized tips', 'Gum cleaning', 'Before', 'After'],
        },
        {
          tabLabel: 'Premium Osstem Chair',
          title: 'Premium Osstem Chair',
          lead: 'Premium dental chair system for precision treatment and improved patient comfort.',
          paragraphs: [
            'Smooth electronic controls, integrated LED lighting, and ergonomic layout enhance treatment precision and workflow speed.',
            'The treatment room setup follows sterilization standards to ensure safe and professional care delivery.',
          ],
          highlightsTitle: 'Highlights',
          highlights: [
            'Flexible positioning for multiple procedures.',
            'Improved comfort in longer sessions.',
            'Integrated support system for efficient workflow.',
          ],
          thumbnails: ['Treatment chair', 'Control module', 'LED lighting', 'Room setup', 'Sterile design'],
        },
      ];

  const activeTechnology = modernTechnologies[activeTechIndex];

  const doctors = isVi
    ? [
        {
          role: 'Bác sĩ Chuyên khoa I',
          name: 'Phạm Nguyễn',
          summary: [
            'Nguyên Phó Trưởng khoa Phẫu thuật Hàm mặt - BV Răng Hàm Mặt TPHCM.',
            'Giấy phép hành nghề số 004447/HCM - CCHN.',
            'Chuyên Cấy Ghép Implant.',
            'Chứng chỉ: Cấy ghép Nha khoa, Phẫu thuật tăng thể tích xương và nâng xoang.',
            'Bác sĩ Răng Hàm Mặt - Đại học Y dược TPHCM.',
          ],
          cta: 'Xem chi tiết',
        },
        {
          role: 'Bác sĩ Chuyên khoa I',
          name: 'Ngô Minh Trí',
          summary: [
            'Hơn 12 năm kinh nghiệm trong điều trị nha khoa tổng quát và thẩm mỹ.',
            'Chuyên sâu bọc răng sứ và phục hình thẩm mỹ.',
            'Tham gia đào tạo liên tục về công nghệ CAD/CAM.',
            'Luôn ưu tiên điều trị bảo tồn răng thật cho khách hàng.',
          ],
          cta: 'Xem chi tiết',
        },
        {
          role: 'Bác sĩ Chuyên khoa I',
          name: 'Huỳnh Tấn Phát',
          summary: [
            'Phụ trách chuyên môn chỉnh nha cho trẻ em và người lớn.',
            'Kinh nghiệm điều trị mắc cài kim loại, mắc cài sứ và Invisalign.',
            'Lập kế hoạch điều trị dựa trên phân tích khớp cắn chi tiết.',
            'Theo dõi sát tiến trình để đảm bảo kết quả ổn định lâu dài.',
          ],
          cta: 'Xem chi tiết',
        },
        {
          role: 'Thạc sĩ - Bác sĩ',
          name: 'Trần Đức Anh',
          summary: [
            'Chuyên sâu cấy ghép Implant đơn lẻ và toàn hàm.',
            'Thực hiện thành công nhiều ca phục hình phức tạp.',
            'Ứng dụng CT Cone Beam 3D trong lập kế hoạch điều trị.',
            'Đặt tiêu chí an toàn và ít xâm lấn lên hàng đầu.',
          ],
          cta: 'Xem chi tiết',
        },
        {
          role: 'Bác sĩ Chuyên khoa',
          name: 'Nguyễn Minh Hiếu',
          summary: [
            'Kinh nghiệm trong điều trị nha chu và phục hình răng mất.',
            'Tư vấn cá nhân hóa theo nhu cầu thẩm mỹ và chức năng ăn nhai.',
            'Thực hiện điều trị nhẹ nhàng, tối ưu trải nghiệm khách hàng.',
            'Đồng hành theo dõi sau điều trị để duy trì kết quả bền vững.',
          ],
          cta: 'Xem chi tiết',
        },
      ]
    : [
        {
          role: 'Specialist Dentist',
          name: 'Pham Nguyen',
          summary: [
            'Former Deputy Head of Maxillofacial Surgery at a major dental hospital.',
            'Licensed practitioner with strong implant surgery background.',
            'Experienced in bone grafting and sinus lift procedures.',
            'Focused on safe, predictable, and minimally invasive treatment.',
          ],
          cta: 'View details',
        },
        {
          role: 'Specialist Dentist',
          name: 'Ngo Minh Tri',
          summary: [
            'Over 12 years of experience in general and cosmetic dentistry.',
            'Specialized in porcelain restoration and smile design.',
            'Continuously trained in CAD/CAM workflows.',
            'Prioritizes conservative treatment planning.',
          ],
          cta: 'View details',
        },
        {
          role: 'Specialist Dentist',
          name: 'Huynh Tan Phat',
          summary: [
            'Focused on orthodontic care for teens and adults.',
            'Experienced with metal braces, ceramic braces, and Invisalign.',
            'Builds treatment plans from detailed bite analysis.',
            'Provides close follow-up for long-term stability.',
          ],
          cta: 'View details',
        },
        {
          role: 'Master - Dentist',
          name: 'Tran Duc Anh',
          summary: [
            'Specialized in single and full-arch implant procedures.',
            'Handled many advanced restorative cases.',
            'Uses Cone Beam 3D imaging for precision planning.',
            'Emphasizes safety and minimally invasive techniques.',
          ],
          cta: 'View details',
        },
        {
          role: 'Specialist Dentist',
          name: 'Nguyen Minh Hieu',
          summary: [
            'Experienced in periodontal and prosthodontic treatments.',
            'Provides personalized consultation for function and esthetics.',
            'Known for gentle procedures and patient comfort.',
            'Offers thorough post-treatment follow-up care.',
          ],
          cta: 'View details',
        },
      ];

  const activeDoctor = doctors[activeDoctorIndex];

  const commitments = isVi
    ? [
        {
          icon: camKetChatLuong,
          title: 'Dịch vụ chất lượng',
          description: 'Cam kết chất lượng điều trị với đội ngũ bác sĩ nha khoa giỏi.',
        },
        {
          icon: camKetMinhBach,
          title: 'Chi phí minh bạch',
          description: 'Không phát sinh - Báo giá minh bạch - Hợp đồng rõ ràng.',
        },
        {
          icon: camKetChinhHang,
          title: 'Bảo hành chính hãng',
          description: 'Cam kết bảo hành rõ ràng, minh bạch, dài hạn, an tâm tuyệt đối.',
        },
        {
          icon: camKetHoTro,
          title: 'Hỗ trợ nhanh chóng',
          description: 'Hỗ trợ tận tâm, đồng hành suốt quá trình phục hồi.',
        },
      ]
    : [
        {
          icon: camKetChatLuong,
          title: 'Quality Service',
          description: 'High treatment standards with a skilled and dedicated dental team.',
        },
        {
          icon: camKetMinhBach,
          title: 'Transparent Pricing',
          description: 'No hidden cost - Clear quotation - Transparent treatment contract.',
        },
        {
          icon: camKetChinhHang,
          title: 'Official Warranty',
          description: 'Clear and long-term warranty policy for complete peace of mind.',
        },
        {
          icon: camKetHoTro,
          title: 'Fast Support',
          description: 'Dedicated support and guidance throughout the recovery journey.',
        },
      ];

  const customerStories = isVi
    ? [
        {
          customer: 'Thu Hoàng',
          headline: 'Giải pháp Implant All On 4',
          excerpt: 'Khách hàng Thu Hoàng phục hồi toàn hàm chắc khỏe, cải thiện ăn nhai và nụ cười rõ rệt.',
        },
        {
          customer: 'Lan Chi',
          headline: 'Implant trụ Hàn Quốc',
          excerpt: 'Lan Chi tự tin hơn sau khi trồng răng Implant, phục hồi chức năng và thẩm mỹ hài hòa.',
        },
        {
          customer: 'Hùng Thành',
          headline: '24 răng sứ Jelenco Multilayer',
          excerpt: 'Anh Hùng Thành có nụ cười trắng sáng, đều đẹp hơn sau phục hình răng sứ thẩm mỹ.',
        },
        {
          customer: 'Ngọc Ánh',
          headline: 'Niềng răng mắc cài sứ',
          excerpt: 'Quá trình chỉnh nha giúp khớp cắn ổn định và cải thiện rõ đường nét khuôn miệng.',
        },
        {
          customer: 'Bảo Trâm',
          headline: 'Dán sứ Veneer',
          excerpt: 'Bảo tồn răng thật tối đa, nâng tông nụ cười tự nhiên và hài hòa khuôn mặt.',
        },
        {
          customer: 'Minh Quân',
          headline: 'Điều trị tủy và bọc sứ',
          excerpt: 'Khắc phục tình trạng đau nhức kéo dài, phục hồi chức năng răng bền vững.',
        },
        {
          customer: 'Thảo Vy',
          headline: 'Tẩy trắng răng công nghệ lạnh',
          excerpt: 'Màu răng cải thiện rõ sau liệu trình ngắn, hạn chế ê buốt và an toàn men răng.',
        },
        {
          customer: 'Gia Huy',
          headline: 'Nhổ răng khôn không đau',
          excerpt: 'Tiểu phẫu nhẹ nhàng, hồi phục nhanh với quy trình chăm sóc hậu phẫu chi tiết.',
        },
        {
          customer: 'Mỹ Linh',
          headline: 'Trám răng thẩm mỹ',
          excerpt: 'Khôi phục hình thể răng sứt mẻ, cải thiện thẩm mỹ và giảm ê buốt khi ăn uống.',
        },
      ]
    : [
        {
          customer: 'Thu Hoang',
          headline: 'All On 4 Implant Solution',
          excerpt: 'Full-arch rehabilitation improved chewing function and smile confidence.',
        },
        {
          customer: 'Lan Chi',
          headline: 'Korean Implant Fixture',
          excerpt: 'Implant treatment restored both esthetics and oral function effectively.',
        },
        {
          customer: 'Hung Thanh',
          headline: '24 Jelenco Multilayer Crowns',
          excerpt: 'Smile makeover achieved brighter and more natural-looking teeth.',
        },
        {
          customer: 'Ngoc Anh',
          headline: 'Ceramic Braces Treatment',
          excerpt: 'Orthodontic correction improved bite alignment and facial balance.',
        },
        {
          customer: 'Bao Tram',
          headline: 'Veneer Smile Design',
          excerpt: 'Conservative veneer approach enhanced smile harmony and confidence.',
        },
        {
          customer: 'Minh Quan',
          headline: 'Root Canal and Crown',
          excerpt: 'Pain was relieved and tooth function was restored for long-term use.',
        },
        {
          customer: 'Thao Vy',
          headline: 'Cold-Light Whitening',
          excerpt: 'Whiter teeth in a short treatment time with low post-op sensitivity.',
        },
        {
          customer: 'Gia Huy',
          headline: 'Gentle Wisdom Tooth Removal',
          excerpt: 'Minimally invasive procedure with fast recovery and clear aftercare.',
        },
        {
          customer: 'My Linh',
          headline: 'Esthetic Composite Filling',
          excerpt: 'Repaired chipped teeth and improved comfort during daily eating.',
        },
      ];

  const storiesPerPage = 3;
  const totalStoryPages = Math.ceil(customerStories.length / storiesPerPage);
  const visibleStories = customerStories.slice(
    activeStoryPage * storiesPerPage,
    activeStoryPage * storiesPerPage + storiesPerPage,
  );

  const shiftStoryPage = (step: number) => {
    setActiveStoryPage((prev) => (prev + step + totalStoryPages) % totalStoryPages);
  };

  const newsTabs = isVi ? ['Kiến thức', 'Sự kiện', 'Ưu đãi'] : ['Knowledge', 'Events', 'Promotions'];

  const newsData = isVi
    ? [
        {
          featured: [
            {
              title: 'Lễ ký kết hợp tác chiến lược và chuyển giao công nghệ Implant',
              date: '05/02/2026',
              excerpt:
                'Nha khoa Tâm Đức Smile chính thức ký kết hợp tác chiến lược và chuyển giao công nghệ Implant với đối tác quốc tế.',
            },
            {
              title: 'Chăm sóc nụ cười toàn diện với ưu đãi hấp dẫn trong tháng này',
              date: '26/09/2025',
              excerpt:
                'Nhiều ưu đãi chuyên sâu cho trồng Implant, niềng răng và phục hình thẩm mỹ, giúp tối ưu chi phí điều trị.',
            },
          ],
          side: [
            'Niềng răng Invisalign - Khay trong suốt, chỉnh nha thẩm mỹ hiệu quả',
            'Dán sứ Veneer là gì? Chi phí, ưu điểm và lưu ý quan trọng',
            'Trồng răng Implant toàn hàm là gì? Chi phí và lộ trình',
            'Implant All On 4 là gì? Ưu điểm và đối tượng phù hợp',
            'Tẩy trắng răng công nghệ cao có an toàn không?',
          ],
        },
        {
          featured: [
            {
              title: 'Tâm Đức Smile khai trương khu điều trị công nghệ cao',
              date: '12/01/2026',
              excerpt:
                'Không gian điều trị mới được trang bị hệ thống chẩn đoán hình ảnh hiện đại, nâng cao trải nghiệm khách hàng.',
            },
            {
              title: 'Hội thảo chuyên đề Implant với chuyên gia quốc tế',
              date: '28/11/2025',
              excerpt:
                'Đội ngũ bác sĩ cập nhật kỹ thuật cấy ghép Implant mới, tăng độ chính xác và an toàn trong điều trị.',
            },
          ],
          side: [
            'Tổng kết sự kiện tư vấn nụ cười tại chi nhánh Quận 7',
            'Chuỗi workshop chăm sóc răng miệng cho doanh nghiệp',
            'Tâm Đức Smile đồng hành cùng chương trình sức khỏe học đường',
            'Ngày hội khám răng miễn phí cho cộng đồng',
            'Talkshow “Niềng răng đúng cách” cùng bác sĩ chuyên môn',
          ],
        },
        {
          featured: [
            {
              title: 'Ưu đãi 30% cho gói niềng răng trong tháng',
              date: '03/03/2026',
              excerpt:
                'Áp dụng cho khách hàng đăng ký mới, hỗ trợ trả góp linh hoạt và tặng kèm bộ chăm sóc răng miệng.',
            },
            {
              title: 'Combo thăm khám và vệ sinh răng định kỳ giá tốt',
              date: '18/02/2026',
              excerpt:
                'Gói ưu đãi giúp kiểm tra tổng quát, cạo vôi và tư vấn cá nhân hóa với mức chi phí tiết kiệm.',
            },
          ],
          side: [
            'Ưu đãi trồng Implant trọn gói, tiết kiệm đến 20%',
            'Tặng gói scan 3D khi đăng ký niềng răng Invisalign',
            'Combo tẩy trắng răng + trám thẩm mỹ ưu đãi đặc biệt',
            'Giảm giá cho khách hàng tái khám đúng lịch',
            'Voucher chăm sóc răng cho khách hàng mới',
          ],
        },
      ]
    : [
        {
          featured: [
            {
              title: 'Strategic Implant technology partnership ceremony',
              date: '05/02/2026',
              excerpt: 'Tam Duc Smile signed a strategic partnership to transfer advanced implant technologies.',
            },
            {
              title: 'Comprehensive smile care with monthly promotions',
              date: '26/09/2025',
              excerpt: 'Special offers for implants, orthodontics, and esthetic restoration this month.',
            },
          ],
          side: [
            'Invisalign treatment overview and key benefits',
            'What is Veneer? Cost, benefits, and notes',
            'Full-arch implant: process and expected cost',
            'All On 4: who should consider this method?',
            'Is high-tech whitening safe for enamel?',
          ],
        },
        {
          featured: [
            {
              title: 'New high-tech treatment zone opening',
              date: '12/01/2026',
              excerpt: 'A new treatment area with modern diagnostics to improve patient care quality.',
            },
            {
              title: 'International implant workshop with experts',
              date: '28/11/2025',
              excerpt: 'Doctors updated clinical implant protocols for safer and more accurate outcomes.',
            },
          ],
          side: [
            'Community oral health consultation event highlights',
            'Corporate oral care workshop series',
            'School oral health support program',
            'Free dental screening day',
            'Orthodontic talkshow with specialists',
          ],
        },
        {
          featured: [
            {
              title: '30% off selected orthodontic packages',
              date: '03/03/2026',
              excerpt: 'Flexible installment plans and additional care kits available for new registrations.',
            },
            {
              title: 'Periodic check-up and cleaning combo deal',
              date: '18/02/2026',
              excerpt: 'Comprehensive oral exam and scaling package at a cost-saving rate.',
            },
          ],
          side: [
            'Implant package promotion up to 20% savings',
            'Free 3D scan with Invisalign package registration',
            'Whitening + esthetic filling combo offers',
            'Discount for on-time follow-up visits',
            'New customer oral care voucher',
          ],
        },
      ];

  const activeNews = newsData[activeNewsTab];

  return (
    <section className="space-y-16">
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-slate-200 bg-white shadow-xl shadow-slate-200/80">
        <img
          alt={isVi ? 'Banner nha khoa' : 'Dental banner'}
          className="h-[320px] w-full object-cover md:h-[400px] lg:h-[460px]"
          src={bannerHome}
        />

        <div className="absolute bottom-4 left-1/2 w-full max-w-5xl -translate-x-1/2 px-4">
          <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/70 md:grid-cols-3">
            {quickActions.map((item) => (
              <button
                className="flex items-center gap-4 border-b border-slate-200 px-5 py-5 text-left transition hover:bg-sky-50 md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0"
                key={item.title}
                type="button"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-sky-200 bg-sky-50 text-xl">
                  {item.icon}
                </span>
                <span>
                  <strong className="block text-2xl font-bold text-blue-700">{item.title}</strong>
                  <span className="text-sm text-slate-600">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
        <p className="text-center text-sm font-medium text-blue-600">
          {isVi ? 'Lý do khách hàng tin chọn' : 'Why customers choose us'}
        </p>
        <h2 className="mt-2 text-center text-4xl font-black text-blue-700 md:text-5xl">
          {isVi ? 'NHA KHOA TẬN TÂM' : 'TAN TAM DENTAL'}
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr]">
          <div className="space-y-6">
            {leftReasons.map((item) => (
              <article className="text-center lg:text-left" key={item.number}>
                <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                  {item.number}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <img alt={isVi ? 'Về chúng tôi' : 'About us'} className="w-full max-w-md" src={veChungToi} />
          </div>

          <div className="space-y-6">
            {rightReasons.map((item) => (
              <article className="text-center lg:text-left" key={item.number}>
                <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-2xl font-bold text-sky-700">
                  {item.number}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-sky-100/60 md:px-10 md:py-14">
        <div className="pointer-events-none absolute -left-6 top-10 h-20 w-20 rounded-full bg-white/50 blur-2xl" />
        <div className="pointer-events-none absolute -right-8 bottom-8 h-24 w-24 rounded-full bg-sky-200/50 blur-2xl" />

        <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
          {isVi ? 'Dịch vụ nha khoa nổi bật' : 'Featured Dental Services'}
        </h2>

        <div className="relative mx-auto mt-10 max-w-6xl">
          <button
            aria-label={isVi ? 'Dịch vụ trước' : 'Previous service'}
            className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-700 text-2xl text-white shadow-lg transition hover:bg-blue-800 md:grid"
            onClick={() => shiftFeaturedService(-1)}
            type="button"
          >
            &#8249;
          </button>

          <button
            aria-label={isVi ? 'Dịch vụ tiếp theo' : 'Next service'}
            className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-500 text-2xl text-white shadow-lg transition hover:bg-blue-600 md:grid"
            onClick={() => shiftFeaturedService(1)}
            type="button"
          >
            &#8250;
          </button>

          <div className="grid gap-5 md:grid-cols-3 md:px-16">
            {visibleServiceIndexes.map((itemIndex, slotIndex) => {
              const item = featuredServices[itemIndex];
              const isCenter = slotIndex === 1;

              return (
                <Link
                  className={`group block overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isCenter ? 'md:scale-100' : 'md:translate-y-6 md:scale-[0.94] md:opacity-95'
                  }`}
                  key={`${item.title}-${itemIndex}`}
                  to={item.to}
                >
                  <div className="relative h-[280px] overflow-hidden bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                    <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-slate-300" />
                    <p className="absolute inset-0 grid place-items-center px-8 text-center text-sm font-semibold text-slate-500">
                      {isVi ? 'Ảnh slide sẽ bổ sung sau' : 'Slide image will be added later'}
                    </p>
                  </div>

                  <div className="relative bg-blue-700 px-5 py-4">
                    <p className="text-sm font-bold uppercase tracking-wide text-white/90">{item.eyebrow}</p>
                    <p className="text-[34px] font-black uppercase leading-tight text-yellow-300">{item.title}</p>
                    <span className="absolute -bottom-3 left-1/2 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-yellow-300 text-xs text-blue-700 shadow">
                      &#10049;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-center gap-2">
            {featuredServices.map((item, index) => (
              <button
                aria-label={`${isVi ? 'Chuyển đến' : 'Go to'} ${item.title}`}
                className={`h-2.5 rounded-full transition ${index === activeServiceIndex ? 'w-8 bg-blue-700' : 'w-2.5 bg-slate-400 hover:bg-slate-500'}`}
                key={`${item.title}-${index}`}
                onClick={() => setActiveServiceIndex(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-[#f3f5f8] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8">
        <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
          {isVi ? 'Công nghệ hiện đại' : 'Modern Technology'}
        </h2>

        <div className="mx-auto mt-8 max-w-5xl overflow-x-auto">
          <div className="inline-flex min-w-full rounded-xl border border-blue-600 bg-white p-1">
            {modernTechnologies.map((technology, index) => {
              const isActive = index === activeTechIndex;
              return (
                <button
                  className={`rounded-lg px-5 py-3 text-sm font-bold transition md:text-base ${
                    isActive ? 'bg-blue-700 text-white shadow' : 'text-slate-600 hover:bg-blue-50'
                  }`}
                  key={technology.title}
                  onClick={() => setActiveTechIndex(index)}
                  type="button"
                >
                  {technology.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[86px_1fr_1fr]">
          <div className="grid grid-cols-5 gap-3 lg:grid-cols-1">
            {activeTechnology.thumbnails.map((thumb) => (
              <button
                key={thumb}
                type="button"
                className="group relative h-[78px] overflow-hidden rounded-xl border border-blue-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <span className="absolute inset-0 bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
                <span className="absolute inset-0 grid place-items-center px-2 text-center text-xs font-semibold text-slate-500 group-hover:text-slate-700">
                  {thumb}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="relative grid min-h-[420px] place-items-center overflow-hidden rounded-xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
              <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-slate-300" />
              <p className="relative z-10 px-6 text-center text-base font-semibold text-slate-500">
                {isVi ? 'Ảnh công nghệ sẽ bổ sung sau' : 'Technology image will be added later'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-2xl font-black text-blue-700">{activeTechnology.title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-700">{activeTechnology.lead}</p>
            <div className="mt-4 max-h-[315px] space-y-4 overflow-y-auto pr-2 text-base leading-8 text-slate-700">
              {activeTechnology.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <p className="pt-1 text-xl font-black text-blue-700">{activeTechnology.highlightsTitle}</p>
              <ul className="list-disc space-y-2 pl-6">
                {activeTechnology.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
        <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
          {isVi ? 'Đội ngũ bác sĩ' : 'Doctor Team'}
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
          <div>
            <div className="inline-block rounded-md bg-white px-4 py-3">
              <h3 className="text-2xl font-black text-blue-700 md:text-3xl">
                {activeDoctor.role} - {activeDoctor.name}
              </h3>
            </div>

            <ul className="mt-5 space-y-3 text-base leading-7 text-slate-700">
              {activeDoctor.summary.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <button
              className="mt-6 inline-flex items-center rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-800"
              type="button"
            >
              {activeDoctor.cta}
            </button>
          </div>

          <div className="mx-auto w-full max-w-[340px]">
            <div className="grid h-[380px] place-items-center overflow-hidden rounded-[28px] border border-blue-200 bg-white shadow-sm md:h-[430px]">
              <div className="m-4 grid h-[calc(100%-2rem)] w-[calc(100%-2rem)] place-items-center rounded-[24px] border-2 border-dashed border-slate-300 bg-linear-to-br from-slate-100 via-slate-200 to-slate-100 text-center">
                <p className="px-6 text-base font-semibold text-slate-500 md:text-lg">
                  {isVi ? 'Ảnh bác sĩ sẽ bổ sung sau' : 'Doctor image will be added later'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {doctors.map((doctor, index) => {
            const isActive = index === activeDoctorIndex;
            return (
              <button
                className="group text-center"
                key={doctor.name}
                onClick={() => setActiveDoctorIndex(index)}
                type="button"
              >
                <div
                  className={`mx-auto grid h-[190px] w-[190px] place-items-center rounded-full border bg-white transition md:h-[230px] md:w-[230px] ${
                    isActive
                      ? 'border-blue-600 shadow-[0_0_0_8px_rgba(37,99,235,0.08)]'
                      : 'border-slate-300 group-hover:border-blue-300'
                  }`}
                >
                  <div className="grid h-[82%] w-[82%] place-items-center rounded-full bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                    <span className="text-base font-bold text-slate-500 md:text-lg">{doctor.name}</span>
                  </div>
                </div>

                <p className="mt-4 text-base text-slate-600">{doctor.role}</p>
                <p className={`text-xl font-bold ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                  {doctor.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-white px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
        <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
          {isVi ? 'Cam kết của Nha Khoa Tâm Đức Smile' : 'Tam Duc Smile Commitments'}
        </h2>
        <p className="mx-auto mt-4 max-w-6xl text-center text-base leading-8 text-slate-700 md:text-lg">
          {isVi
            ? 'Tâm Đức Smile cam kết mang đến nụ cười rạng rỡ và trải nghiệm điều trị chất lượng cao, tận tâm, chuyên nghiệp. Sức khỏe răng miệng của Quý khách là ưu tiên hàng đầu, với dịch vụ vượt trội, an toàn, cùng sự hài lòng tối đa.'
            : 'Tam Duc Smile is committed to delivering excellent dental care with dedication, professionalism, safety, and the highest level of patient satisfaction.'}
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {commitments.map((item) => (
            <article key={item.title} className="flex h-full flex-col">
              <div className="flex h-16 items-center">
                <img alt={item.title} className="h-16 w-16 object-contain" src={item.icon} />
              </div>
              <h3 className="mt-5 min-h-[4.5rem] text-2xl font-black uppercase leading-tight text-blue-700">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-slate-700 md:text-lg">{item.description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
        <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
          {isVi ? 'Câu chuyện khách hàng' : 'Customer Stories'}
        </h2>

        <div className="relative mt-8">
          <button
            aria-label={isVi ? 'Nhóm trước' : 'Previous group'}
            className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-500 text-2xl text-white shadow transition hover:bg-blue-600 lg:grid"
            onClick={() => shiftStoryPage(-1)}
            type="button"
          >
            &#8249;
          </button>

          <button
            aria-label={isVi ? 'Nhóm tiếp theo' : 'Next group'}
            className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-blue-700 text-2xl text-white shadow transition hover:bg-blue-800 lg:grid"
            onClick={() => shiftStoryPage(1)}
            type="button"
          >
            &#8250;
          </button>

          <div className="grid gap-6 lg:grid-cols-3 lg:px-10">
            {visibleStories.map((story) => (
              <article
                key={`${story.customer}-${story.headline}`}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60"
              >
                <div className="relative grid h-[280px] place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                  <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-slate-300" />
                  <p className="relative z-10 px-6 text-center text-sm font-semibold text-slate-500">
                    {isVi ? 'Ảnh khách hàng sẽ bổ sung sau' : 'Customer image will be added later'}
                  </p>
                </div>

                <h3 className="mt-5 text-2xl font-black text-blue-700">
                  {isVi ? `Khách hàng: ${story.customer}` : `Customer: ${story.customer}`}
                </h3>
                <p className="mt-1 text-lg font-bold text-slate-800">{story.headline}</p>
                <p className="mt-3 text-base leading-8 text-slate-700">{story.excerpt}</p>

                <div className="pt-6 text-center">
                  <button
                    className="inline-flex items-center rounded-xl bg-blue-700 px-6 py-3 text-base font-bold text-white transition hover:bg-blue-800"
                    type="button"
                  >
                    {isVi ? 'Xem chi tiết' : 'View details'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalStoryPages }).map((_, pageIndex) => (
              <button
                aria-label={`${isVi ? 'Đến nhóm' : 'Go to group'} ${pageIndex + 1}`}
                className={`h-2.5 rounded-full transition ${
                  pageIndex === activeStoryPage ? 'w-8 bg-blue-700' : 'w-2.5 bg-slate-400 hover:bg-slate-500'
                }`}
                key={pageIndex}
                onClick={() => setActiveStoryPage(pageIndex)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[30px] border border-slate-200 bg-[#eaf2fa] px-4 py-10 shadow-xl shadow-slate-200/70 md:px-8 md:py-12">
        <h2 className="text-center text-4xl font-black uppercase text-blue-700 md:text-5xl">
          {isVi ? 'Tin tức - Ưu đãi' : 'News - Promotions'}
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.95fr_0.95fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {activeNews.featured.map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
                <div className="relative grid h-[320px] place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100">
                  <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-slate-300" />
                  <p className="relative z-10 px-6 text-center text-sm font-semibold text-slate-500">
                    {isVi ? 'Ảnh tin tức sẽ bổ sung sau' : 'News image will be added later'}
                  </p>
                </div>

                <h3 className="mt-4 text-2xl font-black leading-tight text-blue-700">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{item.date}</p>
                <div className="mt-3 h-px w-10 bg-slate-300" />
                <p className="mt-3 text-base leading-8 text-slate-700">{item.excerpt}</p>
              </article>
            ))}
          </div>

          <aside className="rounded-3xl bg-blue-700 p-4 text-white shadow-lg shadow-blue-700/30">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-blue-800/80 p-1">
              {newsTabs.map((tab, index) => (
                <button
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    index === activeNewsTab ? 'bg-white text-blue-700' : 'text-white/90 hover:bg-blue-600'
                  }`}
                  key={tab}
                  onClick={() => setActiveNewsTab(index)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 max-h-[580px] space-y-3 overflow-y-auto pr-1">
              {activeNews.side.map((item) => (
                <button
                  className="grid w-full grid-cols-[108px_1fr] gap-3 rounded-xl p-2 text-left transition hover:bg-blue-600/70"
                  key={item}
                  type="button"
                >
                  <div className="grid h-[70px] place-items-center overflow-hidden rounded-lg bg-white/90 text-xs font-semibold text-slate-500">
                    {isVi ? 'Ảnh nhỏ' : 'Thumb'}
                  </div>
                  <div className="self-center">
                    <p className="line-clamp-2 text-2xl font-bold leading-tight">{item}</p>
                    <div className="mt-2 h-px w-10 bg-white/35" />
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
