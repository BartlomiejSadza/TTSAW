'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Room } from '@/types';
import {
  Search,
  Building2,
  MapPin,
  Users,
  Wrench,
  ChevronRight,
  Filter,
  Loader2,
  Calendar,
  Clock,
  Microscope,
  GraduationCap,
  Presentation,
  Sparkles,
} from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingFilter, minCapacity, roomTypeFilter, availableDate, startTime, endTime]);

  useEffect(() => {
    filterRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, search]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (buildingFilter) params.append('building', buildingFilter);
      if (minCapacity) params.append('minCapacity', minCapacity);
      if (roomTypeFilter) params.append('roomType', roomTypeFilter);
      if (availableDate && startTime && endTime) {
        params.append('availableDate', availableDate);
        params.append('startTime', startTime);
        params.append('endTime', endTime);
      }

      const url = `/api/rooms${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Client-side search filter (for name/description)
    if (search) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(search.toLowerCase()) ||
          room.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredRooms(filtered);
  };

  const buildings = [...new Set(rooms.map((room) => room.building))].sort();

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
        <h1 className="page-title font-[family-name:var(--font-heading)]">Sale</h1>
        <p className="page-description">
          Przeglądaj dostępne sale i dokonuj rezerwacji
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-[var(--color-text-tertiary)]" />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">Filtry</span>
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Szukaj sal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />

          <div className="relative">
            <select
              className="
                w-full px-4 py-3
                bg-[var(--color-bg-elevated)]
                border border-[var(--color-border-default)]
                rounded-[var(--radius-md)]
                text-[var(--color-text-primary)]
                text-base
                appearance-none
                cursor-pointer
                transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
                focus:outline-none
                focus:border-[var(--color-accent-primary)]
                focus:shadow-[0_0_0_3px_var(--color-accent-primary-muted)]
              "
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="">Wszystkie budynki</option>
              {buildings.map((building) => (
                <option key={building} value={building}>
                  Budynek {building}
                </option>
              ))}
            </select>
            <Building2
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
          </div>

          <Input
            type="number"
            placeholder="Min. pojemność"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            min={0}
            leftIcon={<Users size={18} />}
          />
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <div className="relative">
            <select
              className="
                w-full px-4 py-3
                bg-[var(--color-bg-elevated)]
                border border-[var(--color-border-default)]
                rounded-[var(--radius-md)]
                text-[var(--color-text-primary)]
                text-base
                appearance-none
                cursor-pointer
                transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
                focus:outline-none
                focus:border-[var(--color-accent-primary)]
                focus:shadow-[0_0_0_3px_var(--color-accent-primary-muted)]
              "
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="">Wszystkie typy</option>
              <option value="LECTURE">Sala wykładowa</option>
              <option value="LABORATORY">Laboratorium</option>
              <option value="CONFERENCE">Sala konferencyjna</option>
            </select>
            <GraduationCap
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
            />
          </div>

          <Input
            type="date"
            placeholder="Data dostępności"
            value={availableDate}
            onChange={(e) => setAvailableDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            leftIcon={<Calendar size={18} />}
          />

          <Input
            type="time"
            placeholder="Od godziny"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={!availableDate}
            leftIcon={<Clock size={18} />}
          />

          <Input
            type="time"
            placeholder="Do godziny"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={!availableDate}
            leftIcon={<Clock size={18} />}
          />
        </div>

        {/* Clear Filters Button */}
        {(buildingFilter || minCapacity || roomTypeFilter || availableDate || startTime || endTime) && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBuildingFilter('');
                setMinCapacity('');
                setRoomTypeFilter('');
                setAvailableDate('');
                setStartTime('');
                setEndTime('');
              }}
            >
              Wyczyść filtry
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      {filteredRooms.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
            <p className="text-[var(--color-text-secondary)]">
              Nie znaleziono sal spełniających kryteria
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const getRoomTypeIcon = (type: string) => {
              switch (type) {
                case 'LABORATORY':
                  return <Microscope size={14} />;
                case 'CONFERENCE':
                  return <Presentation size={14} />;
                default:
                  return <GraduationCap size={14} />;
              }
            };

            const getRoomTypeLabel = (type: string) => {
              switch (type) {
                case 'LABORATORY':
                  return 'Laboratorium';
                case 'CONFERENCE':
                  return 'Konferencyjna';
                default:
                  return 'Wykładowa';
              }
            };

            return (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card variant="interactive" className="h-full group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary">
                        Budynek {room.building}
                      </span>
                      {!room.isCleaned && (
                        <span className="badge badge-warning" title="Sala już używana dziś - priorytet oszczędności">
                          <Sparkles size={12} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      {getRoomTypeIcon(room.roomType)}
                      <span>{getRoomTypeLabel(room.roomType)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <MapPin size={16} className="text-[var(--color-text-tertiary)]" />
                      <span>Piętro {room.floor}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <Users size={16} className="text-[var(--color-text-tertiary)]" />
                      <span>Pojemność: {room.capacity} osób</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <Wrench size={16} className="text-[var(--color-text-tertiary)]" />
                      <span className="truncate">{room.equipment.join(', ')}</span>
                    </div>
                  </div>

                  {room.description && (
                    <p className="mt-4 text-sm text-[var(--color-text-tertiary)] line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="mt-6 flex items-center gap-1 text-[var(--color-accent-primary)] text-sm font-medium">
                    <span>Zobacz szczegóły</span>
                    <ChevronRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
