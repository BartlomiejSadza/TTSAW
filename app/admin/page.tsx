'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDateTime } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  equipment: string[];
}

interface Reservation {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  room: { name: string; building: string };
  user: { name: string; email: string };
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'rooms' | 'reservations' | 'users'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    building: '',
    floor: 1,
    capacity: 20,
    equipment: '',
    description: '',
  });
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'USER',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'rooms') {
        const response = await fetch('/api/rooms');
        setRooms(await response.json());
      } else if (activeTab === 'users') {
        const response = await fetch('/api/users');
        setUsers(await response.json());
      } else {
        const response = await fetch('/api/reservations?all=true');
        setReservations(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRoom,
          equipment: newRoom.equipment.split(',').map((e) => e.trim()),
        }),
      });

      if (response.ok) {
        setShowAddRoom(false);
        setNewRoom({ name: '', building: '', floor: 1, capacity: 20, equipment: '', description: '' });
        toast.success('Sala została dodana pomyślnie!');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Nie udało się dodać sali');
      }
    } catch (error) {
      console.error('Failed to add room:', error);
      toast.error('Błąd podczas dodawania sali');
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja hasła
    if (newUser.password.length < 6) {
      toast.error('Hasło musi mieć minimum 6 znaków');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setShowAddUser(false);
        setNewUser({ email: '', name: '', password: '', role: 'USER' });
        toast.success('Użytkownik został dodany pomyślnie!');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Nie udało się dodać użytkownika');
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      toast.error('Błąd podczas dodawania użytkownika');
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update reservation:', error);
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Brak uprawnień do panelu administratora</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel administratora</h1>
        <p className="text-gray-600 mt-1">Zarządzaj systemem SmartOffice</p>
      </div>

      <Card>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'rooms' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('rooms')}
          >
            Sale ({rooms.length})
          </Button>
          <Button
            variant={activeTab === 'reservations' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('reservations')}
          >
            Rezerwacje
          </Button>
          <Button
            variant={activeTab === 'users' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('users')}
          >
            Użytkownicy ({users.length})
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">Ładowanie...</p>
          </div>
        </Card>
      ) : (
        <>
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddRoom(true)}>Dodaj salę</Button>
              </div>

              {rooms.map((room) => (
                <Card key={room.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-gray-600">
                        Budynek {room.building}, Piętro {room.floor}, Pojemność: {room.capacity}
                      </p>
                      <p className="text-sm text-gray-500">{room.equipment.join(', ')}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <Card>
                  <p className="text-gray-500">Brak rezerwacji</p>
                </Card>
              ) : (
                reservations.map((res) => (
                  <Card key={res.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{res.title}</h3>
                        <p className="text-sm text-gray-600">
                          {res.room.name} (Budynek {res.room.building})
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(res.startTime)} - {formatDateTime(res.endTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rezerwujący: {res.user.name} ({res.user.email})
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            res.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : res.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      {res.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateReservationStatus(res.id, 'CONFIRMED')}
                          >
                            Potwierdź
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateReservationStatus(res.id, 'CANCELLED')}
                          >
                            Odrzuć
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddUser(true)}>Dodaj użytkownika</Button>
              </div>

              {users.map((user) => (
                <Card key={user.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {showAddRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Dodaj nową salę</h2>
            <form onSubmit={addRoom} className="space-y-4">
              <Input
                label="Nazwa sali"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="np. A101"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Budynek"
                  value={newRoom.building}
                  onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })}
                  placeholder="np. A"
                  required
                />
                <Input
                  label="Piętro"
                  type="number"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Input
                label="Pojemność"
                type="number"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Wyposażenie (oddzielone przecinkami)"
                value={newRoom.equipment}
                onChange={(e) => setNewRoom({ ...newRoom, equipment: e.target.value })}
                placeholder="projektor, tablica, komputery"
              />
              <Input
                label="Opis"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Opis sali..."
              />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddRoom(false)}>
                  Anuluj
                </Button>
                <Button type="submit" className="flex-1">
                  Dodaj
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Dodaj nowego użytkownika</h2>
            <form onSubmit={addUser} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
              <Input
                label="Imię i nazwisko"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Jan Kowalski"
                required
              />
              <Input
                label="Hasło"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Minimum 6 znaków"
                required
                minLength={6}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="USER">Użytkownik</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddUser(false)}>
                  Anuluj
                </Button>
                <Button type="submit" className="flex-1">
                  Dodaj
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
