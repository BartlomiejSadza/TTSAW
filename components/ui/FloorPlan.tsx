'use client';

import { useState } from 'react';
import { Room } from '@/types';

interface FloorPlanProps {
  floor: number;
  rooms: Room[];
  onRoomClick: (room: Room) => void;
}

export default function FloorPlan({ floor, rooms, onRoomClick }: FloorPlanProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Filter rooms for this floor
  const floorRooms = rooms.filter((room) => room.floor === floor);

  // Generate horseshoe layout positions for 10 rooms
  // Horseshoe shape: 3 rooms on left, 4 rooms on top, 3 rooms on right
  const getHorseshoePositions = () => {
    const positions = [
      // Left side (bottom to top)
      { x: 50, y: 350 },   // Room 1
      { x: 50, y: 250 },   // Room 2
      { x: 50, y: 150 },   // Room 3
      // Top side (left to right)
      { x: 150, y: 50 },   // Room 4
      { x: 250, y: 50 },   // Room 5
      { x: 350, y: 50 },   // Room 6
      { x: 450, y: 50 },   // Room 7
      // Right side (top to bottom)
      { x: 550, y: 150 },  // Room 8
      { x: 550, y: 250 },  // Room 9
      { x: 550, y: 350 },  // Room 10
    ];
    return positions;
  };

  const positions = getHorseshoePositions();

  return (
    <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Piętro {floor}</h2>

      <div className="relative w-full h-[450px] bg-white rounded-lg border-2 border-gray-300 shadow-inner">
        {/* Courtyard label in the center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          Dziedziniec
        </div>

        {/* Render rooms */}
        {floorRooms.map((room, index) => {
          const position = positions[index] || { x: 0, y: 0 };
          const isHovered = hoveredRoom === room.id;

          return (
            <button
              key={room.id}
              className={`absolute w-20 h-20 rounded-lg border-2 font-semibold text-sm transition-all duration-200 transform ${
                isHovered
                  ? 'bg-blue-500 text-white border-blue-600 scale-110 shadow-lg z-10'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-400 hover:text-white hover:border-blue-500 hover:scale-105'
              }`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              onClick={() => onRoomClick(room)}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
              title={`${room.name} - Pojemność: ${room.capacity}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-bold">{room.name}</span>
                <span className="text-xs opacity-75">{room.capacity} os.</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Dostępna</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
          <span>Wybrana</span>
        </div>
      </div>
    </div>
  );
}
