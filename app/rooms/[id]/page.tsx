'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Room, Reservation } from '@/types';
import { formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Users,
  Wrench,
  FileText,
  Calendar,
  Clock,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  MapPin,
  Building2,
} from 'lucide-react';

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

  useEffect(() => {
    fetchRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    } catch {
      setError('Wystąpił błąd podczas rezerwacji');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { class: 'badge-warning', label: 'Oczekująca' },
      CONFIRMED: { class: 'badge-success', label: 'Potwierdzona' },
      CANCELLED: { class: 'badge-error', label: 'Anulowana' },
    };
    const { class: badgeClass, label } = config[status as keyof typeof config] || { class: 'badge-default', label: status };
    return <span className={`badge ${badgeClass}`}>{label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    );
  }

  if (!room) {
    return (
      <Card>
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
          <p className="text-[var(--color-text-secondary)] mb-4">Sala nie została znaleziona</p>
          <Button variant="secondary" onClick={() => router.push('/rooms')}>
            Powrót do listy sal
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title font-[family-name:var(--font-heading)]">
            Sala {room.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin size={16} className="text-[var(--color-text-tertiary)]" />
            <span className="text-[var(--color-text-secondary)]">
              Budynek {room.building}, Piętro {room.floor}
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push('/rooms')}
          leftIcon={<ArrowLeft size={18} />}
        >
          Powrót
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Info Card */}
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 font-[family-name:var(--font-heading)]">
            Informacje o sali
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[var(--color-accent-primary-muted)]">
                <Users size={20} className="text-[var(--color-accent-primary)]" />
              </div>
              <div>
                <div className="font-medium text-[var(--color-text-primary)]">Pojemność</div>
                <div className="text-[var(--color-text-secondary)]">{room.capacity} osób</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[var(--color-accent-secondary-muted)]">
                <Wrench size={20} className="text-[var(--color-accent-secondary)]" />
              </div>
              <div>
                <div className="font-medium text-[var(--color-text-primary)]">Wyposażenie</div>
                <div className="text-[var(--color-text-secondary)]">{room.equipment.join(', ')}</div>
              </div>
            </div>

            {room.description && (
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-success-muted)]">
                  <FileText size={20} className="text-[var(--color-success)]" />
                </div>
                <div>
                  <div className="font-medium text-[var(--color-text-primary)]">Opis</div>
                  <div className="text-[var(--color-text-secondary)]">{room.description}</div>
                </div>
              </div>
            )}
          </div>

          <Button
            className="w-full mt-8"
            size="lg"
            onClick={() => setShowReservationForm(true)}
            leftIcon={<Calendar size={18} />}
          >
            Zarezerwuj salę
          </Button>
        </Card>

        {/* Upcoming Reservations Card */}
        <Card>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 font-[family-name:var(--font-heading)]">
            Nadchodzące rezerwacje
          </h2>
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-3" strokeWidth={1} />
              <p className="text-[var(--color-text-secondary)]">Brak nadchodzących rezerwacji</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 10).map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {reservation.title}
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Clock size={14} />
                    <span>
                      {formatDateTime(reservation.startTime)} - {formatDateTime(reservation.endTime)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Reservation Modal */}
      {showReservationForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card variant="glass" className="w-full max-w-md animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                Rezerwacja sali {room.name}
              </h2>
              <button
                onClick={() => setShowReservationForm(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReservation} className="space-y-4">
              <Input
                label="Tytuł rezerwacji"
                value={reservationData.title}
                onChange={(e) =>
                  setReservationData({ ...reservationData, title: e.target.value })
                }
                placeholder="np. Spotkanie zespołu"
                required
                leftIcon={<FileText size={18} />}
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
                leftIcon={<Calendar size={18} />}
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
                  leftIcon={<Clock size={18} />}
                />

                <Input
                  label="Godzina zakończenia"
                  type="time"
                  value={reservationData.endTime}
                  onChange={(e) =>
                    setReservationData({ ...reservationData, endTime: e.target.value })
                  }
                  required
                  leftIcon={<Clock size={18} />}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-[var(--color-error-muted)] text-[var(--color-error)] text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowReservationForm(false)}
                >
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isSubmitting}
                  leftIcon={<CheckCircle size={18} />}
                >
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
