import { useLanguage } from '@/contexts/NgonNguContext';

type ThanhLienHeNoiProps = {
  onOpenBooking: () => void;
};

type ContactItem = {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export function ThanhLienHeNoi({ onOpenBooking }: ThanhLienHeNoiProps) {
  const { language } = useLanguage();

  const items: ContactItem[] =
    language === 'vi'
      ? [
          { icon: '📅', label: 'Đặt lịch', onClick: onOpenBooking },
          { icon: '📞', label: 'Hotline', href: 'tel:19008040' },
          { icon: 'Zalo', label: 'Zalo', href: 'https://zalo.me' },
          { icon: 'f', label: 'Facebook', href: 'https://facebook.com' },
        ]
      : [
          { icon: '📅', label: 'Book', onClick: onOpenBooking },
          { icon: '📞', label: 'Hotline', href: 'tel:19008040' },
          { icon: 'Zalo', label: 'Zalo', href: 'https://zalo.me' },
          { icon: 'f', label: 'Facebook', href: 'https://facebook.com' },
        ];

  return (
    <aside className="fixed right-3 top-1/2 z-40 -translate-y-1/2 rounded-[36px] bg-white px-3 py-4 shadow-xl shadow-blue-900/20 md:right-5">
      <ul className="space-y-3">
        {items.map((item) => (
          <li className="text-center" key={item.label}>
            {item.href ? (
              <a className="group inline-flex flex-col items-center gap-2" href={item.href} rel="noreferrer" target="_blank">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-sky-500 text-xl font-bold text-white transition group-hover:bg-sky-600">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold text-sky-800">{item.label}</span>
              </a>
            ) : (
              <button className="group inline-flex flex-col items-center gap-2" onClick={item.onClick} type="button">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-red-500 text-xl font-bold text-white transition group-hover:bg-red-600">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold text-sky-800">{item.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
