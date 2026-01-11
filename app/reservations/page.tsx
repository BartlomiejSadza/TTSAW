'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import {
  Building2,
  Calendar,
  Clock,
  XCircle,
  CalendarCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

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
    const config = {
      PENDING: { class: 'badge-warning', label: 'Oczekująca', icon: Clock },
      CONFIRMED: { class: 'badge-success', label: 'Potwierdzona', icon: CalendarCheck },
      CANCELLED: { class: 'badge-error', label: 'Anulowana', icon: XCircle },
    };
    const { class: badgeClass, label, icon: Icon } = config[status as keyof typeof config] || { class: 'badge-default', label: status, icon: AlertCircle };
    return (
      <span className={`badge ${badgeClass} flex items-center gap-1`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[var(--color-text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title font-[family-name:var(--font-heading)]">Moje rezerwacje</h1>
        <p className="page-description">Zarządzaj swoimi rezerwacjami sal</p>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex gap-2">
          {[
            { key: 'upcoming', label: 'Nadchodzące' },
            { key: 'past', label: 'Przeszłe' },
            { key: 'all', label: 'Wszystkie' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(tab.key as typeof filter)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CalendarCheck size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
            <p className="text-[var(--color-text-secondary)]">Brak rezerwacji</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="hover:border-[var(--color-border-default)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                      {reservation.title}
                    </h3>
                    {getStatusBadge(reservation.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <Building2 size={16} className="text-[var(--color-text-tertiary)]" />
                      <span>
                        Sala {reservation.room.name} (Budynek {reservation.room.building})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <Calendar size={16} className="text-[var(--color-text-tertiary)]" />
                      <span>
                        {formatDateTime(reservation.startTime)} - {formatDateTime(reservation.endTime)}
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
                      leftIcon={<XCircle size={16} />}
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
