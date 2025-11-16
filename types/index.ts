export type Role = 'USER' | 'ADMIN';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: Role;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  equipment: string[];
  description: string | null;
  createdAt: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface ReservationWithDetails extends Reservation {
  room: Room;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface RoomWithReservations extends Room {
  reservations: Reservation[];
}
