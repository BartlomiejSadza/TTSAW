'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Room } from '@/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, search, buildingFilter, minCapacity]);

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

  const filterRooms = () => {
    let filtered = rooms;

    if (search) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(search.toLowerCase()) ||
          room.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (buildingFilter) {
      filtered = filtered.filter((room) => room.building === buildingFilter);
    }

    if (minCapacity) {
      filtered = filtered.filter((room) => room.capacity >= parseInt(minCapacity));
    }

    setFilteredRooms(filtered);
  };

  const buildings = [...new Set(rooms.map((room) => room.building))].sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ładowanie sal...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sale</h1>
        <p className="text-gray-600 mt-1">Przeglądaj dostępne sale i dokonuj rezerwacji</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Szukaj sal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <Input
            type="number"
            placeholder="Min. pojemność"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            min={0}
          />
        </div>
      </Card>

      {filteredRooms.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Nie znaleziono sal spełniających kryteria</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    Budynek {room.building}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>Piętro {room.floor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>Pojemność: {room.capacity} osób</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🔧</span>
                    <span>{room.equipment.join(', ')}</span>
                  </div>
                </div>

                {room.description && (
                  <p className="mt-4 text-sm text-gray-500">{room.description}</p>
                )}

                <Button variant="primary" size="sm" className="w-full mt-4">
                  Zobacz szczegóły
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
