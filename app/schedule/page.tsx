'use client';

import { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  Search,
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
}

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

export default function SchedulePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch rooms on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Fetch events when room or date changes
  const fetchEvents = useCallback(async () => {
    if (!selectedRoom) {
      setEvents([]);
      return;
    }

    setIsLoadingEvents(true);
    try {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, 7);

      const response = await fetch(
        `/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}&roomId=${selectedRoom.id}`
      );
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [selectedRoom, currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

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

  // Filter rooms by search query
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group rooms by building
  const roomsByBuilding = filteredRooms.reduce(
    (acc, room) => {
      if (!acc[room.building]) {
        acc[room.building] = [];
      }
      acc[room.building].push(room);
      return acc;
    },
    {} as Record<string, Room[]>
  );

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title font-[family-name:var(--font-heading)]">
            Plan zajec sal
          </h1>
          <p className="page-description">
            Wybierz sale z listy, aby zobaczyc jej harmonogram
          </p>
        </div>

        {/* Room Selector Dropdown */}
        <div className="relative w-full lg:w-80">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-left transition-all hover:border-[var(--color-border-strong)] focus:outline-none focus:border-[var(--color-accent-primary)] focus:ring-2 focus:ring-[var(--color-accent-primary-muted)]"
          >
            <div className="flex items-center gap-3">
              <Building2 size={20} className="text-[var(--color-text-tertiary)]" />
              <span className={selectedRoom ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)]'}>
                {selectedRoom
                  ? `${selectedRoom.name} (${selectedRoom.building})`
                  : 'Wybierz sale...'}
              </span>
            </div>
            <ChevronDown
              size={20}
              className={`text-[var(--color-text-tertiary)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-lg shadow-xl z-50 max-h-96 overflow-hidden animate-slideUp">
              {/* Search Input */}
              <div className="p-3 border-b border-[var(--color-border-subtle)]">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                  />
                  <input
                    type="text"
                    placeholder="Szukaj sali..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  />
                </div>
              </div>

              {/* Room List */}
              <div className="overflow-y-auto max-h-72">
                {Object.entries(roomsByBuilding).map(([building, buildingRooms]) => (
                  <div key={building}>
                    <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider bg-[var(--color-bg-elevated)]">
                      {building}
                    </div>
                    {buildingRooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-hover)] ${
                          selectedRoom?.id === room.id
                            ? 'bg-[var(--color-accent-primary-muted)] text-[var(--color-accent-primary)]'
                            : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        <span className="font-medium">{room.name}</span>
                        <span className="text-sm text-[var(--color-text-tertiary)]">
                          {room.capacity} miejsc
                        </span>
                      </button>
                    ))}
                  </div>
                ))}

                {filteredRooms.length === 0 && (
                  <div className="px-4 py-8 text-center text-[var(--color-text-tertiary)]">
                    Nie znaleziono sal
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
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
            Dzis
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigateWeek(1)}
            rightIcon={<ChevronRight size={18} />}
          >
            Nastepny
          </Button>
        </div>
        <h2 className="font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
          {format(weekStart, 'LLLL yyyy', { locale: pl })}
        </h2>
      </div>

      {/* Calendar Grid */}
      {!selectedRoom ? (
        <Card className="p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)]" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Wybierz sale
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            Uzyj listy rozwijanej powyzej, aby wybrac sale i zobaczyc jej harmonogram zajec.
          </p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          {/* Selected Room Info */}
          <div className="p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                {selectedRoom.name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {selectedRoom.building} | Pietro {selectedRoom.floor} | {selectedRoom.capacity} miejsc
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRoom(null)}
              leftIcon={<X size={18} />}
            >
              Wyczysc
            </Button>
          </div>

          {isLoadingEvents ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : (
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
                      <div
                        className={
                          isSameDay(day, new Date())
                            ? 'text-[var(--color-accent-primary)]'
                            : 'text-[var(--color-text-secondary)]'
                        }
                      >
                        {format(day, 'EEEE', { locale: pl })}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          isSameDay(day, new Date())
                            ? 'text-[var(--color-accent-primary)]'
                            : 'text-[var(--color-text-primary)]'
                        }`}
                      >
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-8 border-b border-[var(--color-border-subtle)]"
                  >
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
                              <div className="font-medium truncate">
                                {format(new Date(event.start), 'HH:mm')} -{' '}
                                {format(new Date(event.end), 'HH:mm')}
                              </div>
                              <div className="truncate opacity-80">
                                {event.title.split(' - ').slice(1).join(' - ') || event.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No events message */}
          {!isLoadingEvents && events.length === 0 && (
            <div className="p-8 text-center border-t border-[var(--color-border-subtle)]">
              <Calendar size={32} className="mx-auto mb-2 text-[var(--color-text-tertiary)]" />
              <p className="text-[var(--color-text-secondary)]">
                Brak zajec w tym tygodniu dla wybranej sali
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card variant="glass" className="w-full max-w-md animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                Szczegoly zajec
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
                  <div className="text-sm text-[var(--color-text-tertiary)]">Przedmiot</div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {selectedEvent.title.split(' - ').slice(1).join(' - ') || selectedEvent.title}
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
                    {selectedEvent.roomName} ({selectedEvent.building})
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
                  <div className="text-sm text-[var(--color-text-tertiary)]">Prowadzacy</div>
                  <div className="font-medium text-[var(--color-text-primary)]">
                    {selectedEvent.userName}
                  </div>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full mt-6" onClick={() => setSelectedEvent(null)}>
              Zamknij
            </Button>
          </Card>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
}
