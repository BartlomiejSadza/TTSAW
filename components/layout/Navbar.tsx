'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          SmartOffice
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <span className="text-sm text-gray-600">
                {session.user.name}
                {session.user.role === 'ADMIN' && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Wyloguj
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
