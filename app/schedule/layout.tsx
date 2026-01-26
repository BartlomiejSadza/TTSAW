import AppLayout from '@/components/layout/AppLayout';
import { ReactNode } from 'react';

export default function ScheduleLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
