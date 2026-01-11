'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import FloorPlan from '@/components/ui/FloorPlan';
import { Room } from '@/types';
import {
  Map,
  Users,
  Wrench,
  ChevronRight,
  Loader2,
  Building2,
  MapPin,
} from 'lucide-react';

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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[var(--color-success-muted)]">
            <Map size={24} className="text-[var(--color-success)]" />
          </div>
          <h1 className="page-title mb-0 font-[family-name:var(--font-heading)]">
            Plan pięter
          </h1>
        </div>
        <p className="page-description">
          Kliknij na salę, aby zobaczyć szczegóły i dokonać rezerwacji
        </p>
      </div>

      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        </Card>
      ) : (
        <>
          {/* Floor Selector */}
          <Card>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                Wybierz piętro:
              </span>
              <div className="flex gap-2">
                {floors.map((floor) => (
                  <Button
                    key={floor}
                    variant={selectedFloor === floor ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setSelectedFloor(floor);
                      setSelectedRoom(null);
                    }}
                  >
                    Piętro {floor}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Floor Plan Visualization */}
          <FloorPlan
            floor={selectedFloor}
            rooms={rooms}
            onRoomClick={handleRoomClick}
            selectedRoomId={selectedRoom?.id}
          />

          {/* Selected Room Details */}
          {selectedRoom ? (
            <Card className="animate-slideUp">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-[var(--color-accent-primary-muted)]">
                      <Building2 size={24} className="text-[var(--color-accent-primary)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                        {selectedRoom.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <MapPin size={14} />
                        <span>Budynek {selectedRoom.building}, Piętro {selectedRoom.floor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-elevated)]">
                      <Users size={18} className="text-[var(--color-accent-secondary)]" />
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">Pojemność</div>
                        <div className="font-medium text-[var(--color-text-primary)]">{selectedRoom.capacity} osób</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-elevated)]">
                      <Wrench size={18} className="text-[var(--color-success)]" />
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">Wyposażenie</div>
                        <div className="font-medium text-[var(--color-text-primary)] truncate">{selectedRoom.equipment.join(', ')}</div>
                      </div>
                    </div>
                  </div>

                  {selectedRoom.description && (
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                      {selectedRoom.description}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleReserveRoom}
                  size="lg"
                  rightIcon={<ChevronRight size={18} />}
                >
                  Rezerwuj salę
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <Map size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
                <p className="text-[var(--color-text-secondary)]">
                  Wybierz salę z planu piętra, aby zobaczyć szczegóły
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
