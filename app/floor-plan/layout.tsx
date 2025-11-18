import AppLayout from '@/components/layout/AppLayout';

export default function FloorPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
