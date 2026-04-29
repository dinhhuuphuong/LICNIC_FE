import bannerHome from '@/assets/images/banner.png';
import camKetChatLuong from '@/assets/images/chat-luong.svg';
import camKetChinhHang from '@/assets/images/chinh-hang.svg';
import camKetHoTro from '@/assets/images/ho-tro.svg';
import camKetMinhBach from '@/assets/images/minh-bach.svg';
import veChungToi from '@/assets/images/ve-chung-toi.webp';
import { FeaturedDentalServicesSection } from '@/components/FeaturedDentalServicesSection';
import { HomeCommitmentsSection } from '@/components/home/HomeCommitmentsSection';
import { HomeCustomerStoriesSection } from '@/components/home/HomeCustomerStoriesSection';
import { HomeDoctorsSection } from '@/components/home/HomeDoctorsSection';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeNewsSection } from '@/components/home/HomeNewsSection';
import { HomeReasonsSection } from '@/components/home/HomeReasonsSection';
import { HomeTechnologySection } from '@/components/home/HomeTechnologySection';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getPublicBlogPosts, type BlogPost } from '@/services/blogPostService';
import { getActiveDoctorsForHome, type Doctor } from '@/services/doctorService';
import { getApprovedReviews, type ApprovedReviewItem } from '@/services/reviewService';
import { useEffect, useMemo, useState } from 'react';

type DoctorTeamDisplay = {
  doctorId: number;
  role: string;
  name: string;
  avatar: string | null;
  summary: string[];
  cta: string;
};

function mapDoctorToTeamDisplay(d: Doctor, isVi: boolean): DoctorTeamDisplay {
  const role = d.specialization?.trim() ? d.specialization : isVi ? 'Bác sĩ' : 'Dentist';
  const summary: string[] = [];
  if (d.experienceYears != null) {
    summary.push(isVi ? `${d.experienceYears} năm kinh nghiệm` : `${d.experienceYears} years of experience`);
  }
  if (d.description?.trim()) {
    summary.push(
      ...d.description
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  if (summary.length === 0) {
    summary.push(isVi ? 'Thông tin đang được cập nhật.' : 'Information coming soon.');
  }
  return {
    doctorId: d.doctorId,
    role,
    name: d.user.name,
    avatar: d.user.avatar,
    summary,
    cta: isVi ? 'Xem chi tiết' : 'View details',
  };
}

type HomeNewsItem = {
  postId: number;
  title: string;
  excerpt: string;
  date: string;
  thumbnail: string | null;
  categoryName: string;
};

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPostDate(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function mapBlogPostToHomeNewsItem(post: BlogPost): HomeNewsItem {
  const plainContent = stripHtml(post.content || '');
  const excerptText = plainContent.slice(0, 150) + (plainContent.length > 150 ? '...' : '');
  return {
    postId: post.postId,
    title: post.title,
    excerpt: `<p>${excerptText}</p>`,
    date: formatPostDate(post.createdAt),
    thumbnail: post.thumbnail ?? null,
    categoryName: post.category?.categoryName?.trim() || 'Khác',
  };
}

type HomeCustomerStory = {
  reviewId: number;
  customer: string;
  avatar: string | null;
  headline: string;
  excerpt: string;
};

function mapReviewToCustomerStory(review: ApprovedReviewItem): HomeCustomerStory {
  return {
    reviewId: review.reviewId,
    customer: review.userName?.trim() || 'Khach hang',
    avatar: review.userAvatar ?? null,
    headline: review.serviceName?.trim() || 'Dich vu nha khoa',
    excerpt: review.comment?.trim() || '',
  };
}

export function HomePage() {
  const { language } = useLanguage();
  const [activeTechIndex, setActiveTechIndex] = useState(0);
  const [activeDoctorIndex, setActiveDoctorIndex] = useState(0);
  const [activeStoryPage, setActiveStoryPage] = useState(0);
  const [activeNewsTab, setActiveNewsTab] = useState(0);
  const [newsFromApi, setNewsFromApi] = useState<BlogPost[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [reviewsFromApi, setReviewsFromApi] = useState<ApprovedReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

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

  const [doctorsFromApi, setDoctorsFromApi] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setDoctorsLoading(true);
        setDoctorsError(null);
        const res = await getActiveDoctorsForHome();
        if (cancelled) return;
        setDoctorsFromApi(res.data.items);
        setActiveDoctorIndex(0);
      } catch (e) {
        if (!cancelled) {
          setDoctorsError(e instanceof Error ? e.message : 'Request failed');
          setDoctorsFromApi([]);
        }
      } finally {
        if (!cancelled) setDoctorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);
        const res = await getApprovedReviews({ limit: 10, page: 1 });
        if (cancelled) return;
        setReviewsFromApi(res.data.items);
        setActiveStoryPage(0);
      } catch (e) {
        if (cancelled) return;
        setReviewsError(e instanceof Error ? e.message : 'Request failed');
        setReviewsFromApi([]);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayDoctors = useMemo(
    () => doctorsFromApi.map((d) => mapDoctorToTeamDisplay(d, isVi)),
    [doctorsFromApi, isVi],
  );

  useEffect(() => {
    if (displayDoctors.length === 0) return;
    setActiveDoctorIndex((i) => Math.min(i, displayDoctors.length - 1));
  }, [displayDoctors.length]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        const res = await getPublicBlogPosts({ limit: 10, page: 1, status: 'published' });
        if (cancelled) return;
        setNewsFromApi(res.data.items);
        setActiveNewsTab(0);
      } catch (e) {
        if (cancelled) return;
        setNewsError(e instanceof Error ? e.message : 'Request failed');
        setNewsFromApi([]);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeDoctor = displayDoctors[activeDoctorIndex];
  const avatarItems = useMemo(
    () =>
      displayDoctors.map((d) => ({
        id: String(d.doctorId),
        name: d.name,
        role: d.role,
        avatarUrl: d.avatar,
      })),
    [displayDoctors],
  );

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

  const customerStories = useMemo(() => reviewsFromApi.map(mapReviewToCustomerStory), [reviewsFromApi]);

  const storiesPerPage = 3;
  const totalStoryPages = Math.max(1, Math.ceil(customerStories.length / storiesPerPage));
  const visibleStories = customerStories.slice(
    activeStoryPage * storiesPerPage,
    activeStoryPage * storiesPerPage + storiesPerPage,
  );

  useEffect(() => {
    setActiveStoryPage((prev) => Math.min(prev, totalStoryPages - 1));
  }, [totalStoryPages]);

  const shiftStoryPage = (step: number) => {
    setActiveStoryPage((prev) => (prev + step + totalStoryPages) % totalStoryPages);
  };

  const mappedNews = useMemo(() => newsFromApi.map(mapBlogPostToHomeNewsItem), [newsFromApi]);
  const newsCategoryTabs = useMemo(() => {
    const tabs = mappedNews.reduce<string[]>((acc, item) => {
      if (!acc.includes(item.categoryName)) acc.push(item.categoryName);
      return acc;
    }, []);
    return tabs.slice(0, 3);
  }, [mappedNews]);
  const newsTabs = newsCategoryTabs.length > 0 ? newsCategoryTabs : [isVi ? 'Tin mới' : 'Latest'];
  const activeTabName = newsTabs[Math.min(activeNewsTab, newsTabs.length - 1)];
  const filteredNews =
    newsCategoryTabs.length > 0 ? mappedNews.filter((item) => item.categoryName === activeTabName) : mappedNews;
  const activeNews = {
    featured: filteredNews.slice(0, 2),
    side: filteredNews.slice(2),
  };

  return (
    <section className="space-y-16">
      <HomeHeroSection bannerSrc={bannerHome} isVi={isVi} quickActions={quickActions} />

      <HomeReasonsSection aboutImageSrc={veChungToi} isVi={isVi} leftReasons={leftReasons} rightReasons={rightReasons} />

      <FeaturedDentalServicesSection />

      <HomeTechnologySection
        activeTechIndex={activeTechIndex}
        isVi={isVi}
        onSelectTech={setActiveTechIndex}
        technologies={modernTechnologies}
      />

      <HomeDoctorsSection
        activeDoctor={activeDoctor}
        activeDoctorIndex={activeDoctorIndex}
        avatarItems={avatarItems}
        doctorsError={doctorsError}
        doctorsLoading={doctorsLoading}
        isVi={isVi}
        onSelectDoctor={setActiveDoctorIndex}
      />

      <HomeCommitmentsSection commitments={commitments} isVi={isVi} />

      <HomeCustomerStoriesSection
        activeStoryPage={activeStoryPage}
        isVi={isVi}
        onSelectStoryPage={setActiveStoryPage}
        onShiftStoryPage={shiftStoryPage}
        reviewsError={reviewsError}
        reviewsLoading={reviewsLoading}
        totalStoryPages={totalStoryPages}
        visibleStories={visibleStories}
      />

      <HomeNewsSection
        activeNewsTab={activeNewsTab}
        featuredNews={activeNews.featured}
        isVi={isVi}
        newsError={newsError}
        newsLoading={newsLoading}
        newsTabs={newsTabs}
        onSelectNewsTab={setActiveNewsTab}
        sideNews={activeNews.side}
      />
    </section>
  );
}
