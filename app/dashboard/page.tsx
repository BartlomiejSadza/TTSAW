'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import {
  Building2,
  CalendarCheck,
  Calendar,
  Clock,
  ChevronRight,
  Map,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';

interface Stats {
  upcomingCount: number;
  roomsCount: number;
  totalCount: number;
  popularRooms: Array<{ name: string; building: string; count: number }>;
  recentReservations: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    roomName: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const userName = status === 'loading' ? '...' : (session?.user?.name || 'Użytkowniku');

  const quickActions = [
    {
      href: '/rooms',
      icon: Building2,
      title: 'Przeglądaj sale',
      description: 'Znajdź i zarezerwuj salę',
      color: 'primary',
    },
    {
      href: '/reservations',
      icon: CalendarCheck,
      title: 'Moje rezerwacje',
      description: 'Zobacz nadchodzące rezerwacje',
      color: 'secondary',
    },
    {
      href: '/floor-plan',
      icon: Map,
      title: 'Plan pięter',
      description: 'Interaktywny widok budynku',
      color: 'success',
    },
  ];

  const statsCards = [
    {
      label: 'Nadchodzące',
      value: stats?.upcomingCount || 0,
      icon: Clock,
      color: 'primary',
      subtext: 'rezerwacji',
    },
    {
      label: 'Dostępne sale',
      value: stats?.roomsCount || 0,
      icon: Building2,
      color: 'success',
      subtext: 'do wyboru',
    },
    {
      label: 'Wszystkie',
      value: stats?.totalCount || 0,
      icon: Calendar,
      color: 'secondary',
      subtext: 'rezerwacji',
    },
  ];

  const colorClasses = {
    primary: {
      bg: 'bg-[var(--color-accent-primary-muted)]',
      text: 'text-[var(--color-accent-primary)]',
      border: 'border-[var(--color-accent-primary)]',
    },
    secondary: {
      bg: 'bg-[var(--color-accent-secondary-muted)]',
      text: 'text-[var(--color-accent-secondary)]',
      border: 'border-[var(--color-accent-secondary)]',
    },
    success: {
      bg: 'bg-[var(--color-success-muted)]',
      text: 'text-[var(--color-success)]',
      border: 'border-[var(--color-success)]',
    },
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title font-[family-name:var(--font-heading)]">
          Witaj, {userName}!
        </h1>
        <p className="page-description">
          Zarządzaj rezerwacjami sal w systemie SmartOffice
        </p>
      </div>

      {/* Stats Cards */}
      <div className="bento-grid bento-grid-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color as keyof typeof colorClasses];

          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
                    {isLoading ? (
                      <Loader2 size={32} className="animate-spin text-[var(--color-text-tertiary)]" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                    {stat.subtext}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon size={24} className={colors.text} strokeWidth={1.5} />
                </div>
              </div>

              {/* Decorative gradient */}
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${colors.bg} rounded-full blur-3xl opacity-50`} />
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4 font-[family-name:var(--font-heading)]">
          Szybkie akcje
        </h2>
        <div className="bento-grid bento-grid-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const colors = colorClasses[action.color as keyof typeof colorClasses];

            return (
              <Link key={action.href} href={action.href}>
                <Card variant="interactive" className="group h-full">
                  <div className={`p-3 rounded-xl ${colors.bg} w-fit mb-4`}>
                    <Icon size={24} className={colors.text} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                    {action.title}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 text-[var(--color-accent-primary)] text-sm font-medium">
                    <span>Przejdź</span>
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
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
              Nadchodzące rezerwacje
            </h2>
            <Link
              href="/reservations"
              className="text-sm text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] flex items-center gap-1"
            >
              Zobacz wszystkie
              <ChevronRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : stats?.recentReservations.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-3" strokeWidth={1} />
              <p className="text-[var(--color-text-secondary)]">Brak nadchodzących rezerwacji</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recentReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors"
                >
                  <div className="font-medium text-[var(--color-text-primary)] mb-1">
                    {res.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Building2 size={14} />
                    <span>{res.roomName}</span>
                    <span className="text-[var(--color-text-tertiary)]">•</span>
                    <Clock size={14} />
                    <span>{formatDateTime(res.startTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Popular Rooms */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
              Popularne sale
            </h2>
            <div className="flex items-center gap-1 text-sm text-[var(--color-text-tertiary)]">
              <TrendingUp size={14} />
              <span>Top 5</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-tertiary)]" />
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.popularRooms.map((room, index) => (
                <div
                  key={room.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0
                          ? 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
                          : index === 1
                            ? 'bg-[var(--color-text-tertiary)]/20 text-[var(--color-text-secondary)]'
                            : index === 2
                              ? 'bg-[#CD7F32]/20 text-[#CD7F32]'
                              : 'bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)]'
                        }
                      `}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {room.name}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        Budynek {room.building}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[var(--color-text-tertiary)]">
                    <Users size={14} />
                    <span>{room.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
