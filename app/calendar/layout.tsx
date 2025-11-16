import AppLayout from '@/components/layout/AppLayout';
import { ReactNode } from 'react';

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
