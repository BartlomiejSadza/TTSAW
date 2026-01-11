'use client';

import { useSession, signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav
      className="
        sticky top-0
        h-[var(--navbar-height)]
        bg-[rgba(12,12,15,0.8)]
        backdrop-blur-xl
        border-b border-[var(--color-border-subtle)]
        flex items-center justify-end
        px-6 gap-4
        z-30
      "
    >
      {session?.user && (
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="
                w-9 h-9
                rounded-full
                bg-[var(--color-accent-primary-muted)]
                flex items-center justify-center
                text-[var(--color-accent-primary)]
              "
            >
              <User size={18} strokeWidth={1.5} />
            </div>

            {/* User Details */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {session.user.name}
              </span>
              {session.user.role === 'ADMIN' && (
                <span className="badge badge-warning">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
            leftIcon={<LogOut size={16} strokeWidth={1.5} />}
          >
            Wyloguj
          </Button>
        </div>
      )}
    </nav>
  );
}
