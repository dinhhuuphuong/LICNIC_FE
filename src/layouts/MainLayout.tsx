import { BookingModal } from '@/components/layout/BookingModal';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
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
