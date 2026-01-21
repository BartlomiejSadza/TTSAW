'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Map,
  CalendarCheck,
  Calendar,
  CalendarClock,
  Settings,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rooms', label: 'Sale', icon: Building2 },
  { href: '/floor-plan', label: 'Plan pięter', icon: Map },
  { href: '/reservations', label: 'Moje rezerwacje', icon: CalendarCheck },
  { href: '/calendar', label: 'Kalendarz', icon: Calendar },
  { href: '/schedule', label: 'Plan zajęć sal', icon: CalendarClock },
];

const adminItems = [
  { href: '/admin', label: 'Panel admina', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <aside
      className="
        fixed top-0 left-0
        w-[var(--sidebar-width)] h-screen
        bg-[var(--color-bg-surface)]
        border-r border-[var(--color-border-subtle)]
        flex flex-col
        z-40
      "
    >
      {/* Logo Area */}
      <div
        className="
          h-[var(--navbar-height)]
          flex items-center
          px-6
          border-b border-[var(--color-border-subtle)]
        "
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gradient font-[family-name:var(--font-heading)]">
            SmartOffice
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Menu Label */}
        <p className="px-3 py-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
          Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  `
                    relative flex items-center gap-3
                    px-3 py-3
                    rounded-[var(--radius-md)]
                    text-sm font-medium
                    transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
                    group
                  `,
                  isActive
                    ? 'bg-[var(--color-accent-primary-muted)] text-[var(--color-accent-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className="
                      absolute left-0 top-1/2 -translate-y-1/2
                      w-[3px] h-6
                      bg-[var(--color-accent-primary)]
                      rounded-r-full
                    "
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors duration-[var(--duration-normal)]',
                    isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)]">
              <p className="px-3 py-4 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Administracja
              </p>
            </div>

            <div className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      `
                        relative flex items-center gap-3
                        px-3 py-3
                        rounded-[var(--radius-md)]
                        text-sm font-medium
                        transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
                        group
                      `,
                      isActive
                        ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                        : 'text-[var(--color-warning)] hover:bg-[var(--color-bg-hover)]'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className="
                          absolute left-0 top-1/2 -translate-y-1/2
                          w-[3px] h-6
                          bg-[var(--color-warning)]
                          rounded-r-full
                        "
                      />
                    )}
                    <Icon
                      size={20}
                      strokeWidth={1.5}
                      className="text-[var(--color-warning)]"
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
