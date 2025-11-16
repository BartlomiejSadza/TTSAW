'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';

interface ReservationWithRoom {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
    building: string;
  };
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationWithRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        toast.success('Rezerwacja została anulowana');
        fetchReservations();
      } else {
        toast.error('Nie udało się anulować rezerwacji');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      toast.error('Wystąpił błąd podczas anulowania');
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const now = new Date();
    const endTime = new Date(res.endTime);

    if (filter === 'upcoming') {
      return endTime > now && res.status !== 'CANCELLED';
    }
    if (filter === 'past') {
      return endTime <= now || res.status === 'CANCELLED';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };

    const labels = {
      PENDING: 'Oczekująca',
      CONFIRMED: 'Potwierdzona',
      CANCELLED: 'Anulowana',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ładowanie rezerwacji...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moje rezerwacje</h1>
        <p className="text-gray-600 mt-1">Zarządzaj swoimi rezerwacjami sal</p>
      </div>

      <Card>
        <div className="flex gap-2">
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Nadchodzące
          </Button>
          <Button
            variant={filter === 'past' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('past')}
          >
            Przeszłe
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Wszystkie
          </Button>
        </div>
      </Card>

      {filteredReservations.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Brak rezerwacji</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reservation.title}
                    </h3>
                    {getStatusBadge(reservation.status)}
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>🏫</span>
                      <span>
                        Sala {reservation.room.name} (Budynek {reservation.room.building})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>
                        {formatDateTime(reservation.startTime)} -{' '}
                        {formatDateTime(reservation.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {reservation.status !== 'CANCELLED' &&
                  new Date(reservation.startTime) > new Date() && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelReservation(reservation.id)}
                    >
                      Anuluj
                    </Button>
                  )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
