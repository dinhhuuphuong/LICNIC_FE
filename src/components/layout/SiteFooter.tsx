import logoFooter from '@/assets/images/logo-footer.png';
import { useLanguage } from '@/contexts/NgonNguContext';
import { getClinicInfo, parseWorkingHours } from '@/services/clinicInfoService';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

export function SiteFooter() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isVi = language === 'vi';
  const { data } = useQuery({
    queryKey: ['clinic-info'],
    queryFn: getClinicInfo,
  });
  const workingHoursByDay = parseWorkingHours(data?.data?.workingHours);
  const weekdayWorkingRange = workingHoursByDay[1];
  const saturdayWorkingRange = workingHoursByDay[6];
  const sundayWorkingRange = workingHoursByDay[0];
  const isWeekdayAndSaturdaySame =
    weekdayWorkingRange.start === saturdayWorkingRange.start && weekdayWorkingRange.end === saturdayWorkingRange.end;
  const isSaturdayAndSundaySame =
    saturdayWorkingRange.start === sundayWorkingRange.start && saturdayWorkingRange.end === sundayWorkingRange.end;
  const isAllWeekSame = isWeekdayAndSaturdaySame && isSaturdayAndSundaySame;

  const firstHoursLineText = isVi
    ? isAllWeekSame
      ? `Mở cửa (T2 - CN): ${weekdayWorkingRange.start} - ${weekdayWorkingRange.end}`
      : isWeekdayAndSaturdaySame
        ? `Mở cửa (T2 - T7): ${weekdayWorkingRange.start} - ${weekdayWorkingRange.end}`
        : `Mở cửa (T2 - T6): ${weekdayWorkingRange.start} - ${weekdayWorkingRange.end}`
    : isAllWeekSame
      ? `Opening hours (Mon - Sun): ${weekdayWorkingRange.start} - ${weekdayWorkingRange.end}`
      : isWeekdayAndSaturdaySame
        ? `Opening hours (Mon - Sat): ${weekdayWorkingRange.start} - ${weekdayWorkingRange.end}`
        : `Opening hours (Mon - Fri): ${weekdayWorkingRange.start} - ${weekdayWorkingRange.end}`;

  const secondHoursLineText = isVi
    ? isAllWeekSame
      ? null
      : isSaturdayAndSundaySame
        ? `Cuối tuần (T7 - CN): ${saturdayWorkingRange.start} - ${saturdayWorkingRange.end}`
        : `T7: ${saturdayWorkingRange.start} - ${saturdayWorkingRange.end}; CN: ${sundayWorkingRange.start} - ${sundayWorkingRange.end}`
    : isAllWeekSame
      ? null
      : isSaturdayAndSundaySame
        ? `Weekend (Sat - Sun): ${saturdayWorkingRange.start} - ${saturdayWorkingRange.end}`
        : `Sat: ${saturdayWorkingRange.start} - ${saturdayWorkingRange.end}; Sun: ${sundayWorkingRange.start} - ${sundayWorkingRange.end}`;

  const infoLinks = isVi
    ? ['Giới thiệu', 'Đội ngũ bác sĩ', 'Dịch vụ', 'Bảng giá', 'Sự kiện', 'Ưu đãi', 'Kiến thức', 'Tuyển dụng', 'Liên hệ']
    : ['About', 'Doctors', 'Services', 'Pricing', 'Events', 'Promotions', 'Knowledge', 'Recruitment', 'Contact'];

  const supportLinks = isVi
    ? [
        'Điều khoản dịch vụ',
        'Bảo mật thông tin',
        'Chính sách bảo hành',
        'Chính sách thanh toán',
        'Chính sách trả góp',
        'Đặt lịch hẹn và hủy lịch',
        'Hình ảnh và nội dung',
        'Miễn trừ trách nhiệm',
      ]
    : [
        'Terms of service',
        'Privacy policy',
        'Warranty policy',
        'Payment policy',
        'Installment policy',
        'Booking and cancellation',
        'Image and content policy',
        'Disclaimer',
      ];

  return (
    <footer className="border-t border-blue-600 bg-blue-700 text-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr_0.95fr_1.1fr]">
          <div>
            <img
              alt="Tận Tâm"
              className="h-20 w-auto origin-left scale-110 md:h-24 [image-rendering:-webkit-optimize-contrast]"
              src={logoFooter}
            />
            <ul className="mt-6 space-y-3 text-base leading-8 text-blue-50">
              <li>{isVi ? `Địa chỉ: ${data?.data.address}` : `Address: ${data?.data.address}`}</li>
              <li>{isVi ? 'Hotline: 1900.8040 - 0329851079' : 'Hotline: 1900.8040 - 0329851079'}</li>
              <li>{isVi ? 'Điện thoại CSKH: 0862451679' : 'Customer care: 0862451679'}</li>
              <li>tantamdental@nhakhoatantam.com</li>
              <li>{firstHoursLineText}</li>
              {secondHoursLineText ? <li>{secondHoursLineText}</li> : null}
            </ul>
          </div>

          <div>
            <h3 className="border-b border-blue-400 pb-3 text-2xl font-black">{isVi ? 'Thông tin' : 'Information'}</h3>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((item) => (
                <li key={item}>
                  <Link
                    className="inline-flex items-center gap-2 text-lg text-blue-50 transition hover:text-white"
                    to="/"
                  >
                    <span>&#8250;</span>
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="border-b border-blue-400 pb-3 text-2xl font-black">{isVi ? 'Hỗ trợ' : 'Support'}</h3>
            <ul className="mt-4 space-y-3">
              {supportLinks.map((item) => (
                <li key={item}>
                  <Link
                    className="inline-flex items-center gap-2 text-lg text-blue-50 transition hover:text-white"
                    to="/"
                  >
                    <span>&#8250;</span>
                    <span>{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="border-b border-blue-400 pb-3 text-2xl font-black">{isVi ? 'Fanpage' : 'Fanpage'}</h3>
            <div className="mt-4 rounded-xl border border-blue-400 bg-blue-800/40 p-3">
              <div className="grid h-[120px] place-items-center rounded-lg bg-white/90 text-center text-sm font-semibold text-slate-500">
                {isVi ? 'Ảnh fanpage sẽ bổ sung sau' : 'Fanpage image will be added later'}
              </div>
            </div>

            <h4 className="mt-6 border-b border-blue-400 pb-3 text-3xl font-black">
              {isVi ? 'Kết nối với Tận Tâm' : 'Connect with Tan Tam'}
            </h4>
            <div className="mt-4 flex flex-wrap gap-3">
              {['f', 'ig', 'tt', 'x', 'yt'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-blue-300 text-sm font-bold uppercase text-white transition hover:bg-blue-600"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-blue-400 pt-6 text-center text-base text-blue-50">
          {isVi
            ? 'Công ty TNHH Nha khoa Tận Tâm - Mã số doanh nghiệp: 0315739299, Ngày cấp: 17/06/2019 bởi Sở Kế hoạch và Đầu tư Tp.Hồ Chí Minh'
            : 'Tan Tam Dental Co., Ltd - Business code: 0315739299, Issued on 17/06/2019 by Ho Chi Minh City Department of Planning and Investment'}
        </div>
      </div>

      <div className="border-t border-blue-500 bg-blue-900/35 px-4 py-4 text-center text-base text-blue-100">
        {isVi
          ? `Copyright by ${currentYear} © Tận Tâm | Răng tốt sức khỏe tốt`
          : `Copyright by ${currentYear} © Tan Tam | Healthy teeth, better life`}
      </div>
    </footer>
  );
}
