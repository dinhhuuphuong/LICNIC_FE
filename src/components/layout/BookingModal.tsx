import { useEffect } from 'react';
import bannerDatLich from '@/assets/images/banner-datlich.jpg';
import { useLanguage } from '@/contexts/NgonNguContext';

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const { language } = useLanguage();

  const text =
    language === 'vi'
      ? {
          dialogLabel: 'Form đặt lịch tư vấn',
          closeLabel: 'Đóng form',
          bannerAlt: 'Banner đặt lịch',
          title: 'Liên Hệ Tư Vấn Ngay',
          description:
            'Vui lòng điền thông tin vào form bên dưới. Chúng tôi sẽ phản hồi Quý khách sớm nhất có thể.',
          fullName: 'Họ và tên*',
          phone: 'Nhập số điện thoại*',
          email: 'Email',
          branch: 'Chi nhánh gần bạn',
          branch1: 'Quận 1',
          branch3: 'Quận 3',
          branch7: 'Quận 7',
          message: 'Nội dung cần tư vấn',
          submit: 'GỬI',
        }
      : {
          dialogLabel: 'Booking consultation form',
          closeLabel: 'Close form',
          bannerAlt: 'Booking banner',
          title: 'Contact For Consultation',
          description:
            'Please fill in the form below. We will get back to you as soon as possible.',
          fullName: 'Full name*',
          phone: 'Phone number*',
          email: 'Email',
          branch: 'Nearest branch',
          branch1: 'District 1',
          branch3: 'District 3',
          branch7: 'District 7',
          message: 'Consultation message',
          submit: 'SEND',
        };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[1160px] overflow-hidden rounded-2xl bg-white p-4 md:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={text.dialogLabel}
      >
        <button
          aria-label={text.closeLabel}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200"
          onClick={onClose}
          type="button"
        >
          &#10005;
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <img alt={text.bannerAlt} className="h-full w-full rounded-xl object-cover" src={bannerDatLich} />
          </div>

          <div className="pr-2">
            <h2 className="text-center text-4xl font-bold text-red-600">{text.title}</h2>
            <p className="mt-3 text-center text-base leading-7 text-blue-700">{text.description}</p>

            <form className="mt-5 space-y-3" onSubmit={(event) => event.preventDefault()}>
              <input
                className="h-14 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-blue-600"
                placeholder={text.fullName}
                type="text"
              />
              <input
                className="h-14 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-blue-600"
                placeholder={text.phone}
                type="tel"
              />
              <input
                className="h-14 w-full rounded-md border border-slate-300 px-4 text-base outline-none transition focus:border-blue-600"
                placeholder={text.email}
                type="email"
              />
              <select
                className="h-14 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-700 outline-none transition focus:border-blue-600"
                defaultValue=""
              >
                <option disabled value="">
                  {text.branch}
                </option>
                <option value="quan1">{text.branch1}</option>
                <option value="quan3">{text.branch3}</option>
                <option value="quan7">{text.branch7}</option>
              </select>
              <textarea
                className="h-36 w-full rounded-md border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-blue-600"
                placeholder={text.message}
              />

              <div className="pt-1 text-center">
                <button
                  className="inline-flex items-center rounded-xl bg-blue-700 px-8 py-3 text-base font-bold text-white transition hover:bg-blue-800"
                  type="submit"
                >
                  {text.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
