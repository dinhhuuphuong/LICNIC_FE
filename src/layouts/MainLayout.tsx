import { BookingModal } from '@/components/layout/BookingModal';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export function MainLayout() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <SiteHeader onOpenBooking={() => setIsBookingOpen(true)} />

      <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-8">
        <Outlet />
      </main>

      <SiteFooter />

      {/* <ThanhLienHeNoi onOpenBooking={() => setIsBookingOpen(true)} /> */}

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
}
