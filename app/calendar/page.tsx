'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Building2,
  Clock,
  User,
  Loader2,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  roomName: string;
  building: string;
  userName: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchEvents = async () => {
    try {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, view === 'week' ? 7 : 30);

      const response = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        isSameDay(eventStart, day) &&
        eventStart.getHours() <= hour &&
        eventEnd.getHours() > hour
      );
    });
  };

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
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
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title font-[family-name:var(--font-heading)]">Kalendarz</h1>
          <p className="page-description">Przeglądaj wszystkie rezerwacje</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateWeek(-1)}
            leftIcon={<ChevronLeft size={18} />}
          >
            Poprzedni
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            leftIcon={<Calendar size={18} />}
          >
            Dziś
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateWeek(1)}
            rightIcon={<ChevronRight size={18} />}
          >
            Następny
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card padding="none" className="overflow-hidden">
        {/* Month Header */}
        <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          <h2 className="font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
            {format(weekStart, 'LLLL yyyy', { locale: pl })}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-[var(--color-border-subtle)]">
              <div className="p-3 text-sm font-medium text-[var(--color-text-tertiary)] border-r border-[var(--color-border-subtle)]">
                Godzina
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`p-3 text-sm font-medium text-center border-r border-[var(--color-border-subtle)] ${
                    isSameDay(day, new Date())
                      ? 'bg-[var(--color-accent-primary-muted)]'
                      : ''
                  }`}
                >
                  <div className={isSameDay(day, new Date()) ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)]'}>
                    {format(day, 'EEEE', { locale: pl })}
                  </div>
                  <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-[var(--color-border-subtle)]">
                <div className="p-3 text-sm text-[var(--color-text-tertiary)] border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
                  {hour}:00
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="p-1 min-h-[60px] border-r border-[var(--color-border-subtle)] relative bg-[var(--color-bg-base)] hover:bg-[var(--color-bg-surface)] transition-colors"
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="
                            text-xs p-2 mb-1 rounded-md
                            bg-[var(--color-accent-primary-muted)]
                            border border-[var(--color-accent-primary)]
                            text-[var(--color-accent-primary)]
                            cursor-pointer
                            hover:bg-[var(--color-accent-primary)]
                            hover:text-white
                            transition-colors
                          "
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="font-medium truncate">{event.roomName}</div>
                          <div className="truncate opacity-80">{event.title.split(' - ')[1] || event.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card variant="glass" className="w-full max-w-md animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                Szczegóły rezerwacji
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-accent-primary-muted)]">
                  <Calendar size={20} className="text-[var(--color-accent-primary)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-text-tertiary)]">Tytuł</div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {selectedEvent.title.split(' - ')[1] || selectedEvent.title}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-accent-secondary-muted)]">
                  <Building2 size={20} className="text-[var(--color-accent-secondary)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-text-tertiary)]">Sala</div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {selectedEvent.roomName} (Budynek {selectedEvent.building})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-success-muted)]">
                  <Clock size={20} className="text-[var(--color-success)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-text-tertiary)]">Czas</div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {format(new Date(selectedEvent.start), 'PPp', { locale: pl })} -{' '}
                    {format(new Date(selectedEvent.end), 'p', { locale: pl })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-warning-muted)]">
                  <User size={20} className="text-[var(--color-warning)]" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-text-tertiary)]">Rezerwujący</div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {selectedEvent.userName}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full mt-6"
              onClick={() => setSelectedEvent(null)}
            >
              Zamknij
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
