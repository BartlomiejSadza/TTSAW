import AppLayout from '@/components/layout/AppLayout';
import { ReactNode } from 'react';

export default function RoomsLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
