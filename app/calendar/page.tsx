'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';

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
  const [view, setView] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

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
        <div className="text-gray-500">Ładowanie kalendarza...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalendarz</h1>
          <p className="text-gray-600 mt-1">Przeglądaj wszystkie rezerwacje</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigateWeek(-1)}>
            Poprzedni
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Dziś
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigateWeek(1)}>
            Następny
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">
            {format(weekStart, 'LLLL yyyy', { locale: pl })}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 text-sm font-medium text-gray-500 border-r">
                Godzina
              </div>
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-sm font-medium text-center border-r ${
                    isSameDay(day, new Date())
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  <div>{format(day, 'EEEE', { locale: pl })}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-2 text-sm text-gray-500 border-r">
                  {hour}:00
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="p-1 min-h-[60px] border-r relative"
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="font-medium truncate">{event.roomName}</div>
                          <div className="truncate">{event.title.split(' - ')[1]}</div>
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

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Szczegóły rezerwacji</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Tytuł</div>
                <div className="font-medium">{selectedEvent.title.split(' - ')[1]}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sala</div>
                <div className="font-medium">
                  {selectedEvent.roomName} (Budynek {selectedEvent.building})
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Czas</div>
                <div className="font-medium">
                  {format(new Date(selectedEvent.start), 'PPp', { locale: pl })} -{' '}
                  {format(new Date(selectedEvent.end), 'p', { locale: pl })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rezerwujący</div>
                <div className="font-medium">{selectedEvent.userName}</div>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full mt-4"
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
