'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FloorPlan from '@/components/ui/FloorPlan';
import { Room } from '@/types';

export default function FloorPlanPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

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

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleReserveRoom = () => {
    if (selectedRoom) {
      router.push(`/rooms/${selectedRoom.id}`);
    }
  };

  const floors = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan pięter - wybór sali</h1>
        <p className="text-gray-600 mt-1">
          Kliknij na salę, aby zobaczyć szczegóły i dokonać rezerwacji
        </p>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Ładowanie...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Floor selector */}
          <Card>
            <div className="flex gap-2">
              {floors.map((floor) => (
                <Button
                  key={floor}
                  variant={selectedFloor === floor ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedFloor(floor)}
                >
                  Piętro {floor}
                </Button>
              ))}
            </div>
          </Card>

          {/* Floor plan visualization */}
          <FloorPlan
            floor={selectedFloor}
            rooms={rooms}
            onRoomClick={handleRoomClick}
          />

          {/* Selected room details */}
          {selectedRoom && (
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedRoom.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Budynek {selectedRoom.building}, Piętro {selectedRoom.floor}
                  </p>
                  <p className="text-sm text-gray-600">Pojemność: {selectedRoom.capacity} osób</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Wyposażenie: {selectedRoom.equipment.join(', ')}
                  </p>
                  {selectedRoom.description && (
                    <p className="text-sm text-gray-700 mt-2">{selectedRoom.description}</p>
                  )}
                </div>
                <Button onClick={handleReserveRoom}>Rezerwuj salę</Button>
              </div>
            </Card>
          )}

          {!selectedRoom && (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">Wybierz salę z planu piętra, aby zobaczyć szczegóły</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
