'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Room, Reservation } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationData, setReservationData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      if (!response.ok) throw new Error('Room not found');
      const data = await response.json();
      setRoom(data.room);
      setReservations(data.reservations);
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const startTime = new Date(`${reservationData.date}T${reservationData.startTime}`);
      const endTime = new Date(`${reservationData.date}T${reservationData.endTime}`);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: id,
          title: reservationData.title,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Błąd podczas rezerwacji');
      } else {
        setShowReservationForm(false);
        setReservationData({ title: '', date: '', startTime: '', endTime: '' });
        fetchRoom();
      }
    } catch (err) {
      setError('Wystąpił błąd podczas rezerwacji');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ładowanie...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Sala nie została znaleziona</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push('/rooms')}>
            Powrót do listy sal
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sala {room.name}</h1>
          <p className="text-gray-600 mt-1">Budynek {room.building}, Piętro {room.floor}</p>
        </div>
        <Button variant="secondary" onClick={() => router.push('/rooms')}>
          Powrót
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacje o sali</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className="font-medium">Pojemność</div>
                <div className="text-gray-600">{room.capacity} osób</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <div className="font-medium">Wyposażenie</div>
                <div className="text-gray-600">{room.equipment.join(', ')}</div>
              </div>
            </div>

            {room.description && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className="font-medium">Opis</div>
                  <div className="text-gray-600">{room.description}</div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full mt-6"
            onClick={() => setShowReservationForm(true)}
          >
            Zarezerwuj salę
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nadchodzące rezerwacje</h2>
          {reservations.length === 0 ? (
            <p className="text-gray-500">Brak nadchodzących rezerwacji</p>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 10).map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium">{reservation.title}</div>
                  <div className="text-sm text-gray-600">
                    {formatDateTime(reservation.startTime)} - {formatDateTime(reservation.endTime)}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      reservation.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : reservation.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {reservation.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {showReservationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Rezerwacja sali {room.name}
            </h2>
            <form onSubmit={handleReservation} className="space-y-4">
              <Input
                label="Tytuł rezerwacji"
                value={reservationData.title}
                onChange={(e) =>
                  setReservationData({ ...reservationData, title: e.target.value })
                }
                placeholder="np. Spotkanie zespołu"
                required
              />

              <Input
                label="Data"
                type="date"
                value={reservationData.date}
                onChange={(e) =>
                  setReservationData({ ...reservationData, date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Godzina rozpoczęcia"
                  type="time"
                  value={reservationData.startTime}
                  onChange={(e) =>
                    setReservationData({ ...reservationData, startTime: e.target.value })
                  }
                  required
                />

                <Input
                  label="Godzina zakończenia"
                  type="time"
                  value={reservationData.endTime}
                  onChange={(e) =>
                    setReservationData({ ...reservationData, endTime: e.target.value })
                  }
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowReservationForm(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                  Zarezerwuj
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
