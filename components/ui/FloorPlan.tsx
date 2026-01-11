'use client';

import { useState } from 'react';
import { Room } from '@/types';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloorPlanProps {
  floor: number;
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  selectedRoomId?: string;
}

export default function FloorPlan({ floor, rooms, onRoomClick, selectedRoomId }: FloorPlanProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Filter and sort rooms for this floor
  const floorRooms = rooms
    .filter((room) => room.floor === floor)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Generate horseshoe layout positions for rooms
  // Horseshoe shape: 3 rooms on left, 4 rooms on top, 3 rooms on right (10 total)
  const getPositions = (roomCount: number) => {
    const positions = [
      // Left side (bottom to top)
      { x: 50, y: 320 },   // Room 1
      { x: 50, y: 210 },   // Room 2
      { x: 50, y: 100 },   // Room 3
      // Top side (left to right)
      { x: 160, y: 20 },   // Room 4
      { x: 270, y: 20 },   // Room 5
      { x: 380, y: 20 },   // Room 6
      { x: 490, y: 20 },   // Room 7
      // Right side (top to bottom)
      { x: 570, y: 100 },  // Room 8
      { x: 570, y: 210 },  // Room 9
      { x: 570, y: 320 },  // Room 10
    ];

    // If there are more than 10 rooms, add them in a bottom row
    if (roomCount > 10) {
      const extraRooms = roomCount - 10;
      for (let i = 0; i < extraRooms; i++) {
        positions.push({ x: 160 + (i * 110), y: 420 });
      }
    }

    return positions;
  };

  const positions = getPositions(floorRooms.length);

  // Check if there are any rooms on this floor
  if (floorRooms.length === 0) {
    return (
      <div className="rounded-xl p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
        <div className="relative w-full h-[450px] rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center">
          <p className="text-[var(--color-text-tertiary)] text-lg">Brak sal na tym piętrze</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
      <div className="relative w-full h-[450px] rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] overflow-hidden">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Courtyard in the center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-40">
          <div className="w-full h-full rounded-2xl bg-[var(--color-courtyard)] border-2 border-dashed border-[var(--color-border-default)] flex items-center justify-center">
            <span className="text-[var(--color-text-tertiary)] text-sm font-medium">
              Dziedziniec
            </span>
          </div>
        </div>

        {/* Render rooms */}
        {floorRooms.map((room, index) => {
          const position = positions[index];
          const isHovered = hoveredRoom === room.id;
          const isSelected = selectedRoomId === room.id;

          return (
            <button
              key={room.id}
              className={cn(
                `
                  absolute w-[90px] h-[80px]
                  rounded-xl
                  border-2
                  font-semibold text-sm
                  transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
                  flex flex-col items-center justify-center gap-1
                  cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-elevated)]
                `,
                isSelected
                  ? 'bg-[var(--color-room-selected)] border-[var(--color-accent-primary)] shadow-[var(--glow-primary)] z-20 scale-105'
                  : isHovered
                    ? 'bg-[var(--color-accent-primary-muted)] border-[var(--color-accent-primary)] shadow-[var(--glow-primary)] z-10 scale-105'
                    : 'bg-[var(--color-room-available)] border-[var(--color-room-border)] hover:bg-[var(--color-accent-primary-muted)] hover:border-[var(--color-accent-primary)] hover:scale-105'
              )}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              onClick={() => onRoomClick(room)}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
              title={`${room.name} - Pojemność: ${room.capacity}`}
            >
              <span className={cn(
                'text-sm font-bold font-[family-name:var(--font-heading)]',
                isSelected || isHovered
                  ? 'text-[var(--color-accent-primary)]'
                  : 'text-[var(--color-text-primary)]'
              )}>
                {room.name}
              </span>
              <span className={cn(
                'flex items-center gap-1 text-xs',
                isSelected || isHovered
                  ? 'text-[var(--color-accent-primary-hover)]'
                  : 'text-[var(--color-text-secondary)]'
              )}>
                <Users size={12} />
                {room.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--color-room-available)] border border-[var(--color-room-border)]" />
          <span>Dostępna</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--color-room-selected)] border border-[var(--color-accent-primary)] shadow-[var(--glow-primary)]" />
          <span>Wybrana</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--color-room-booked)] border border-[var(--color-border-subtle)] opacity-60" />
          <span>Zajęta</span>
        </div>
      </div>
    </div>
  );
}
