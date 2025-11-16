import AppLayout from '@/components/layout/AppLayout';
import { ReactNode } from 'react';

export default function ReservationsLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
