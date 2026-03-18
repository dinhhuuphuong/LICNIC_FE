import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logoTanTam from '@/assets/images/logoTanTam.jpg';
import { ROUTES } from '@/constants/routes';
import { useLanguage, type Language } from '@/contexts/NgonNguContext';

type TopMenuItem = {
  label: string;
  hasDropdown?: boolean;
  isHot?: boolean;
  isActive?: boolean;
};

type ServiceGroup = {
  title: string;
  items: string[];
};

type SiteHeaderProps = {
  onOpenBooking: () => void;
};

const languageOptions: Array<{ code: Language; shortLabel: string; label: string; flag: string }> = [
  { code: 'vi', shortLabel: 'VI', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', shortLabel: 'EN', label: 'English', flag: '🇬🇧' },
];

export function SiteHeader({ onOpenBooking }: SiteHeaderProps) {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const isAboutActive = location.pathname.startsWith('/gioi-thieu/');
  const isPriceActive = location.pathname.startsWith('/bang-gia/');
  const isKnowledgeActive = location.pathname.startsWith('/kien-thuc/');

  const [isAboutMenuOpen, setIsAboutMenuOpen] = useState(false);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [isPriceMenuOpen, setIsPriceMenuOpen] = useState(false);
  const [isKnowledgeMenuOpen, setIsKnowledgeMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const aboutMenuRef = useRef<HTMLDivElement>(null);
  const serviceMenuRef = useRef<HTMLDivElement>(null);
  const priceMenuRef = useRef<HTMLDivElement>(null);
  const knowledgeMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = languageOptions.find((item) => item.code === language) ?? languageOptions[0];

  const topMenuItems: TopMenuItem[] =
    language === 'vi'
      ? [
          { label: 'Ưu đãi', isHot: true },
          { label: 'Khách hàng' },
          { label: 'Liên hệ', hasDropdown: true },
        ]
      : [
          { label: 'Promotions', isHot: true },
          { label: 'Customers' },
          { label: 'Contact', hasDropdown: true },
        ];

  const aboutSubItems =
    language === 'vi'
      ? [
          { label: 'Về Tâm Đức Smile', to: ROUTES.about },
          { label: 'Đội ngũ Bác sĩ', to: ROUTES.aboutTeam },
          { label: 'Cơ sở vật chất', to: ROUTES.aboutFacilities },
          { label: 'Tuyển dụng', to: ROUTES.aboutRecruitment },
        ]
      : [
          { label: 'About Tam Duc Smile', to: ROUTES.about },
          { label: 'Our Doctors', to: ROUTES.aboutTeam },
          { label: 'Facilities', to: ROUTES.aboutFacilities },
          { label: 'Recruitment', to: ROUTES.aboutRecruitment },
        ];

  const priceSubItems =
    language === 'vi'
      ? [
          { label: 'Giá trồng răng Implant', to: ROUTES.priceImplant },
          { label: 'Giá niềng răng', to: ROUTES.priceBraces },
          { label: 'Giá bọc răng sứ', to: ROUTES.pricePorcelain },
        ]
      : [
          { label: 'Implant Price', to: ROUTES.priceImplant },
          { label: 'Braces Price', to: ROUTES.priceBraces },
          { label: 'Porcelain Crown Price', to: ROUTES.pricePorcelain },
        ];

  const knowledgeSubItems =
    language === 'vi'
      ? [
          { label: 'Kiến thức Implant', to: ROUTES.knowledgeImplant },
          { label: 'Kiến thức niềng răng', to: ROUTES.knowledgeBraces },
          { label: 'Kiến thức răng sứ', to: ROUTES.knowledgePorcelain },
        ]
      : [
          { label: 'Implant Knowledge', to: ROUTES.knowledgeImplant },
          { label: 'Braces Knowledge', to: ROUTES.knowledgeBraces },
          { label: 'Porcelain Knowledge', to: ROUTES.knowledgePorcelain },
        ];

  const serviceGroups: ServiceGroup[] =
    language === 'vi'
      ? [
          {
            title: 'BỌC RĂNG SỨ',
            items: ['Dán sứ Veneer', 'Inlay - Onlay', 'Bọc răng sứ là gì'],
          },
          {
            title: 'TRỒNG RĂNG IMPLANT',
            items: ['Cấy ghép răng Implant', 'Implant toàn hàm', 'Implant All On 4', 'Implant All On 6', 'Trồng răng Implant là gì'],
          },
          {
            title: 'NIỀNG RĂNG',
            items: ['Niềng răng Invisalign', 'Niềng mắc cài', 'Niềng mắc cài sứ', 'Niềng răng trẻ em', 'Niềng răng là gì'],
          },
          {
            title: 'DỊCH VỤ KHÁC',
            items: ['Tẩy trắng răng', 'Trám răng', 'Cạo vôi răng', 'Nhổ răng', 'Việt Kiều'],
          },
        ]
      : [
          {
            title: 'PORCELAIN CROWNS',
            items: ['Veneers', 'Inlay - Onlay', 'What is a Porcelain Crown?'],
          },
          {
            title: 'IMPLANT',
            items: ['Dental Implant', 'Full-Arch Implant', 'All-On-4 Implant', 'All-On-6 Implant', 'What is Implant?'],
          },
          {
            title: 'ORTHODONTICS',
            items: ['Invisalign', 'Metal Braces', 'Ceramic Braces', 'Braces for Kids', 'What is Orthodontics?'],
          },
          {
            title: 'OTHER SERVICES',
            items: ['Teeth Whitening', 'Dental Filling', 'Scaling', 'Tooth Extraction', 'Overseas Service'],
          },
        ];

  const text =
    language === 'vi'
      ? {
          searchPlaceholder: 'Tìm kiếm thông tin nha khoa tại đây...',
          searchAriaLabel: 'Tìm kiếm',
          consultLabel: 'Liên hệ tư vấn',
          aboutMenu: 'Giới thiệu',
          serviceMenu: 'Dịch vụ',
          priceMenu: 'Bảng giá',
          knowledgeMenu: 'Kiến thức',
          loginButton: 'Đăng nhập',
          registerButton: 'Đăng ký',
          bookButton: 'ĐẶT LỊCH',
        }
      : {
          searchPlaceholder: 'Search dental information here...',
          searchAriaLabel: 'Search',
          consultLabel: 'Consultation Hotline',
          aboutMenu: 'About',
          serviceMenu: 'Services',
          priceMenu: 'Pricing',
          knowledgeMenu: 'Knowledge',
          loginButton: 'Login',
          registerButton: 'Sign up',
          bookButton: 'BOOK NOW',
        };

  useEffect(() => {
    setIsAboutMenuOpen(false);
    setIsServiceMenuOpen(false);
    setIsPriceMenuOpen(false);
    setIsKnowledgeMenuOpen(false);
    setIsLanguageMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!aboutMenuRef.current?.contains(event.target as Node)) {
        setIsAboutMenuOpen(false);
      }
      if (!serviceMenuRef.current?.contains(event.target as Node)) {
        setIsServiceMenuOpen(false);
      }
      if (!priceMenuRef.current?.contains(event.target as Node)) {
        setIsPriceMenuOpen(false);
      }
      if (!knowledgeMenuRef.current?.contains(event.target as Node)) {
        setIsKnowledgeMenuOpen(false);
      }
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto w-full max-w-[1360px] px-4">
        <div className="flex flex-wrap items-center gap-4 py-3 lg:flex-nowrap">
          <Link className="shrink-0" to={ROUTES.home}>
            <img alt="Tam Duc Smile" className="h-20 w-auto" src={logoTanTam} />
          </Link>

          <form className="relative w-full lg:max-w-[760px]" onSubmit={(event) => event.preventDefault()}>
            <input
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-5 pr-16 text-base text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white"
              placeholder={text.searchPlaceholder}
              type="text"
            />
            <button
              aria-label={text.searchAriaLabel}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-xl text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
              type="submit"
            >
              &#128269;
            </button>
          </form>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 md:flex">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 text-lg text-slate-600">
                &#128222;
              </span>
              <div className="leading-tight">
                <p className="text-sm text-slate-500">{text.consultLabel}</p>
                <p className="text-4xl font-bold text-slate-900">1900 8040</p>
              </div>
            </div>

            <div className="relative" ref={languageMenuRef}>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
                type="button"
              >
                <span className="text-base">{selectedLanguage.flag}</span>
                {selectedLanguage.shortLabel}
                <span className={`text-xs text-slate-400 transition ${isLanguageMenuOpen ? 'rotate-180' : ''}`}>
                  &#9662;
                </span>
              </button>

              <div
                className={`absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg transition ${
                  isLanguageMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                }`}
              >
                {languageOptions.map((item) => (
                  <button
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                      language === item.code ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      setIsLanguageMenuOpen(false);
                    }}
                    type="button"
                  >
                    <span>{item.flag}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pb-3 pt-2">
          <nav className="flex flex-wrap items-center gap-5">
            <NavLink
              className="grid h-10 w-10 place-items-center rounded-md border-b-2 border-slate-300 text-slate-900"
              to={ROUTES.home}
            >
              &#127968;
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setIsAboutMenuOpen(true)}
              onMouseLeave={() => setIsAboutMenuOpen(false)}
              ref={aboutMenuRef}
            >
              <button
                className={`inline-flex items-center gap-1 border-b-2 px-0.5 py-2 text-base font-semibold transition ${
                  isAboutActive ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
                onClick={() => setIsAboutMenuOpen((prev) => !prev)}
                type="button"
              >
                {text.aboutMenu}
                <span className={`text-sm text-slate-400 transition ${isAboutMenuOpen ? 'rotate-180' : ''}`}>&#9662;</span>
              </button>

              <div className={`absolute left-0 top-full z-20 w-[380px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition ${isAboutMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                {aboutSubItems.map((item) => (
                  <NavLink key={item.to} className={({ isActive }) => `block rounded-xl px-4 py-3 text-base font-medium transition ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-blue-600 hover:text-white'}`} onClick={() => setIsAboutMenuOpen(false)} to={item.to}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="relative" onMouseEnter={() => setIsServiceMenuOpen(true)} onMouseLeave={() => setIsServiceMenuOpen(false)} ref={serviceMenuRef}>
              <button
                className={`inline-flex items-center gap-1 border-b-2 px-0.5 py-2 text-base font-semibold transition ${
                  isServiceMenuOpen ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
                onClick={() => setIsServiceMenuOpen((prev) => !prev)}
                type="button"
              >
                {text.serviceMenu}
                <span className={`text-sm text-slate-400 transition ${isServiceMenuOpen ? 'rotate-180' : ''}`}>&#9662;</span>
              </button>

              <div className={`absolute left-0 top-full z-20 w-[960px] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg transition ${isServiceMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                <div className="grid grid-cols-4 gap-2">
                  {serviceGroups.map((group) => (
                    <div key={group.title}>
                      <button className="mb-1 block w-full rounded-lg px-3 py-3 text-left text-base font-extrabold text-slate-900 transition hover:bg-blue-600 hover:text-white" type="button">{group.title}</button>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <button className="block w-full rounded-lg px-3 py-2 text-left text-[15px] font-medium text-slate-700 transition hover:bg-blue-600 hover:text-white" key={item} type="button">{item}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative" onMouseEnter={() => setIsPriceMenuOpen(true)} onMouseLeave={() => setIsPriceMenuOpen(false)} ref={priceMenuRef}>
              <button
                className={`inline-flex items-center gap-1 border-b-2 px-0.5 py-2 text-base font-semibold transition ${
                  isPriceActive || isPriceMenuOpen ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
                onClick={() => setIsPriceMenuOpen((prev) => !prev)}
                type="button"
              >
                {text.priceMenu}
                <span className={`text-sm text-slate-400 transition ${isPriceMenuOpen ? 'rotate-180' : ''}`}>&#9662;</span>
              </button>

              <div className={`absolute left-0 top-full z-20 w-[380px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition ${isPriceMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                {priceSubItems.map((item) => (
                  <NavLink key={item.to} className={({ isActive }) => `block rounded-xl px-4 py-3 text-base font-medium transition ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-blue-600 hover:text-white'}`} onClick={() => setIsPriceMenuOpen(false)} to={item.to}>{item.label}</NavLink>
                ))}
              </div>
            </div>

            <div className="relative" onMouseEnter={() => setIsKnowledgeMenuOpen(true)} onMouseLeave={() => setIsKnowledgeMenuOpen(false)} ref={knowledgeMenuRef}>
              <button
                className={`inline-flex items-center gap-1 border-b-2 px-0.5 py-2 text-base font-semibold transition ${
                  isKnowledgeActive || isKnowledgeMenuOpen ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
                onClick={() => setIsKnowledgeMenuOpen((prev) => !prev)}
                type="button"
              >
                {text.knowledgeMenu}
                <span className={`text-sm text-slate-400 transition ${isKnowledgeMenuOpen ? 'rotate-180' : ''}`}>&#9662;</span>
              </button>

              <div className={`absolute left-0 top-full z-20 w-[380px] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition ${isKnowledgeMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                {knowledgeSubItems.map((item) => (
                  <NavLink key={item.to} className={({ isActive }) => `block rounded-xl px-4 py-3 text-base font-medium transition ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-blue-600 hover:text-white'}`} onClick={() => setIsKnowledgeMenuOpen(false)} to={item.to}>{item.label}</NavLink>
                ))}
              </div>
            </div>

            {topMenuItems.map((item) => (
              <button key={item.label} className={`inline-flex items-center gap-1 border-b-2 px-0.5 py-2 text-base font-semibold transition ${item.isActive ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-700 hover:border-slate-300 hover:text-slate-900'}`} type="button">
                {item.isHot ? <span className="text-red-500">&#10029;HOT&#10029;</span> : null}
                {item.label}
                {item.hasDropdown ? <span className="text-sm text-slate-400">&#9662;</span> : null}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-sky-200 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow"
              to={ROUTES.login}
            >
              {text.loginButton}
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100 px-5 text-sm font-bold text-blue-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:from-blue-100 hover:to-blue-200 hover:shadow"
              to={ROUTES.register}
            >
              {text.registerButton}
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-7 py-3 text-base font-bold text-white transition hover:bg-blue-800"
              onClick={onOpenBooking}
              type="button"
            >
              &#128197; {text.bookButton}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
