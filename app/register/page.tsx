'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Mail, Lock, User, AlertCircle, Building2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Wystąpił błąd podczas rejestracji');
      } else {
        router.push('/login?registered=true');
      }
    } catch {
      setError('Wystąpił błąd podczas rejestracji');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-base)]">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-surface)] via-[var(--color-bg-base)] to-[var(--color-bg-elevated)]" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[var(--color-accent-secondary)] rounded-full opacity-10 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[var(--color-accent-primary)] rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-[var(--color-accent-primary-muted)]">
              <Building2 size={32} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-bold text-gradient font-[family-name:var(--font-heading)]">
              SmartOffice
            </span>
          </div>

          <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4 font-[family-name:var(--font-heading)]">
            Dołącz do SmartOffice
          </h1>

          <p className="text-lg text-[var(--color-text-secondary)] max-w-md">
            Utwórz konto i zacznij korzystać z nowoczesnego systemu rezerwacji sal.
          </p>

          {/* Benefits List */}
          <div className="mt-12 space-y-4">
            {[
              'Szybka rezerwacja sal',
              'Widok dostępności w czasie rzeczywistym',
              'Powiadomienia o zmianach',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card variant="glass" className="w-full max-w-md p-8 animate-slideUp">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 size={28} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
              <span className="text-2xl font-bold text-gradient font-[family-name:var(--font-heading)]">
                SmartOffice
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-accent-secondary-muted)] mb-4">
              <UserPlus size={24} className="text-[var(--color-accent-secondary)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
              Utwórz konto
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Wypełnij formularz, aby się zarejestrować
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Imię i nazwisko"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
              required
              leftIcon={<User size={18} />}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              required
              leftIcon={<Mail size={18} />}
            />

            <Input
              id="password"
              label="Hasło"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 znaków"
              required
              minLength={6}
              leftIcon={<Lock size={18} />}
            />

            <Input
              id="confirmPassword"
              label="Potwierdź hasło"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              required
              leftIcon={<Lock size={18} />}
            />

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-[var(--color-error-muted)] text-[var(--color-error)] text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Zarejestruj się
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Masz już konto? </span>
            <Link
              href="/login"
              className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] font-medium transition-colors"
            >
              Zaloguj się
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
