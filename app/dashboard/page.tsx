'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';

interface Stats {
  upcomingCount: number;
  roomsCount: number;
  totalCount: number;
  popularRooms: Array<{ name: string; building: string; count: number }>;
  recentReservations: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    roomName: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const userName = status === 'loading' ? '...' : (session?.user?.name || 'Użytkowniku');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Witaj, {userName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Zarządzaj rezerwacjami sal w systemie SmartOffice
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/rooms">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">🏫</div>
            <h3 className="text-lg font-semibold text-gray-900">Przeglądaj sale</h3>
            <p className="text-gray-600 mt-2">
              Zobacz dostępne sale i ich wyposażenie
            </p>
          </Card>
        </Link>

        <Link href="/reservations">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900">Moje rezerwacje</h3>
            <p className="text-gray-600 mt-2">
              Sprawdź swoje nadchodzące rezerwacje
            </p>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">📆</div>
            <h3 className="text-lg font-semibold text-gray-900">Kalendarz</h3>
            <p className="text-gray-600 mt-2">
              Zobacz wszystkie rezerwacje w kalendarzu
            </p>
          </Card>
        </Link>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Szybkie statystyki
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {isLoading ? '...' : stats?.upcomingCount || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Nadchodzące rezerwacje</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {isLoading ? '...' : stats?.roomsCount || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Dostępne sale</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {isLoading ? '...' : stats?.totalCount || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Wszystkie rezerwacje</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nadchodzące rezerwacje
          </h2>
          {isLoading ? (
            <p className="text-gray-500">Ładowanie...</p>
          ) : stats?.recentReservations.length === 0 ? (
            <p className="text-gray-500">Brak nadchodzących rezerwacji</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentReservations.map((res) => (
                <div key={res.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{res.title}</div>
                  <div className="text-sm text-gray-600">
                    {res.roomName} - {formatDateTime(res.startTime)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Popularne sale
          </h2>
          {isLoading ? (
            <p className="text-gray-500">Ładowanie...</p>
          ) : (
            <div className="space-y-3">
              {stats?.popularRooms.map((room, index) => (
                <div key={room.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm text-gray-600">Budynek {room.building}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{room.count} rezerwacji</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
