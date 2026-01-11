'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDateTime } from '@/lib/utils';
import {
  Building2,
  Users,
  CalendarCheck,
  Plus,
  X,
  Check,
  XCircle,
  Shield,
  User,
  Mail,
  Lock,
  MapPin,
  Hash,
  Wrench,
  FileText,
  Loader2,
  Settings,
} from 'lucide-react';

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
      toast.success(status === 'CONFIRMED' ? 'Rezerwacja potwierdzona' : 'Rezerwacja odrzucona');
      fetchData();
    } catch (error) {
      console.error('Failed to update reservation:', error);
      toast.error('Błąd podczas aktualizacji');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { class: 'badge-warning', label: 'Oczekująca' },
      CONFIRMED: { class: 'badge-success', label: 'Potwierdzona' },
      CANCELLED: { class: 'badge-error', label: 'Anulowana' },
    };
    const { class: badgeClass, label } = config[status as keyof typeof config] || { class: 'badge-default', label: status };
    return <span className={`badge ${badgeClass}`}>{label}</span>;
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <Card>
        <div className="text-center py-12">
          <Shield size={48} className="mx-auto text-[var(--color-error)] mb-4" strokeWidth={1} />
          <p className="text-[var(--color-text-secondary)]">Brak uprawnień do panelu administratora</p>
        </div>
      </Card>
    );
  }

  const tabs = [
    { key: 'rooms', label: 'Sale', icon: Building2, count: rooms.length },
    { key: 'reservations', label: 'Rezerwacje', icon: CalendarCheck },
    { key: 'users', label: 'Użytkownicy', icon: Users, count: users.length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[var(--color-warning-muted)]">
            <Settings size={24} className="text-[var(--color-warning)]" />
          </div>
          <h1 className="page-title mb-0 font-[family-name:var(--font-heading)]">
            Panel administratora
          </h1>
        </div>
        <p className="page-description">Zarządzaj systemem SmartOffice</p>
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                leftIcon={<Icon size={16} />}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black/20">
                    {tab.count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-[var(--color-text-tertiary)]" />
          </div>
        </Card>
      ) : (
        <>
          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddRoom(true)} leftIcon={<Plus size={18} />}>
                  Dodaj salę
                </Button>
              </div>

              {rooms.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Building2 size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
                    <p className="text-[var(--color-text-secondary)]">Brak sal w systemie</p>
                  </div>
                </Card>
              ) : (
                rooms.map((room) => (
                  <Card key={room.id} className="hover:border-[var(--color-border-default)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-[var(--color-accent-primary-muted)]">
                          <Building2 size={20} className="text-[var(--color-accent-primary)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">{room.name}</h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Budynek {room.building}, Piętro {room.floor}, Pojemność: {room.capacity}
                          </p>
                          <p className="text-sm text-[var(--color-text-tertiary)]">{room.equipment.join(', ')}</p>
                        </div>
                      </div>
                      <span className="badge badge-primary">
                        {room.capacity} os.
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              {reservations.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <CalendarCheck size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
                    <p className="text-[var(--color-text-secondary)]">Brak rezerwacji</p>
                  </div>
                </Card>
              ) : (
                reservations.map((res) => (
                  <Card key={res.id} className="hover:border-[var(--color-border-default)] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[var(--color-text-primary)]">{res.title}</h3>
                          {getStatusBadge(res.status)}
                        </div>
                        <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                          <div className="flex items-center gap-2">
                            <Building2 size={14} className="text-[var(--color-text-tertiary)]" />
                            <span>{res.room.name} (Budynek {res.room.building})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarCheck size={14} className="text-[var(--color-text-tertiary)]" />
                            <span>{formatDateTime(res.startTime)} - {formatDateTime(res.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-[var(--color-text-tertiary)]" />
                            <span>{res.user.name} ({res.user.email})</span>
                          </div>
                        </div>
                      </div>
                      {res.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateReservationStatus(res.id, 'CONFIRMED')}
                            leftIcon={<Check size={16} />}
                          >
                            Potwierdź
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => updateReservationStatus(res.id, 'CANCELLED')}
                            leftIcon={<XCircle size={16} />}
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

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddUser(true)} leftIcon={<Plus size={18} />}>
                  Dodaj użytkownika
                </Button>
              </div>

              {users.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" strokeWidth={1} />
                    <p className="text-[var(--color-text-secondary)]">Brak użytkowników</p>
                  </div>
                </Card>
              ) : (
                users.map((user) => (
                  <Card key={user.id} className="hover:border-[var(--color-border-default)] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-[var(--color-warning-muted)]' : 'bg-[var(--color-accent-secondary-muted)]'}`}>
                          {user.role === 'ADMIN' ? (
                            <Shield size={20} className="text-[var(--color-warning)]" />
                          ) : (
                            <User size={20} className="text-[var(--color-accent-secondary)]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">{user.name}</h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
                        </div>
                      </div>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-warning' : 'badge-default'}`}>
                        {user.role === 'ADMIN' ? 'Administrator' : 'Użytkownik'}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card variant="glass" className="w-full max-w-md animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                Dodaj nową salę
              </h2>
              <button
                onClick={() => setShowAddRoom(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addRoom} className="space-y-4">
              <Input
                label="Nazwa sali"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                placeholder="np. A101"
                required
                leftIcon={<Building2 size={18} />}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Budynek"
                  value={newRoom.building}
                  onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })}
                  placeholder="np. A"
                  required
                  leftIcon={<MapPin size={18} />}
                />
                <Input
                  label="Piętro"
                  type="number"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                  required
                  leftIcon={<Hash size={18} />}
                />
              </div>
              <Input
                label="Pojemność"
                type="number"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                required
                leftIcon={<Users size={18} />}
              />
              <Input
                label="Wyposażenie (oddzielone przecinkami)"
                value={newRoom.equipment}
                onChange={(e) => setNewRoom({ ...newRoom, equipment: e.target.value })}
                placeholder="projektor, tablica, komputery"
                leftIcon={<Wrench size={18} />}
              />
              <Input
                label="Opis"
                value={newRoom.description}
                onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                placeholder="Opis sali..."
                leftIcon={<FileText size={18} />}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddRoom(false)}>
                  Anuluj
                </Button>
                <Button type="submit" className="flex-1" leftIcon={<Plus size={18} />}>
                  Dodaj
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card variant="glass" className="w-full max-w-md animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                Dodaj nowego użytkownika
              </h2>
              <button
                onClick={() => setShowAddUser(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addUser} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@example.com"
                required
                leftIcon={<Mail size={18} />}
              />
              <Input
                label="Imię i nazwisko"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Jan Kowalski"
                required
                leftIcon={<User size={18} />}
              />
              <Input
                label="Hasło"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Minimum 6 znaków"
                required
                minLength={6}
                leftIcon={<Lock size={18} />}
              />
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Rola
                </label>
                <div className="relative">
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="
                      w-full px-4 py-3 pl-11
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
                    required
                  >
                    <option value="USER">Użytkownik</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                  <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddUser(false)}>
                  Anuluj
                </Button>
                <Button type="submit" className="flex-1" leftIcon={<Plus size={18} />}>
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
