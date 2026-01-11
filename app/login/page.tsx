'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Mail, Lock, AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Nieprawidłowy email lub hasło');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Wystąpił błąd podczas logowania');
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent-primary)] rounded-full opacity-10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--color-accent-secondary)] rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: '1s' }} />

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
            Rezerwuj mądrzej.<br />
            Pracuj lepiej.
          </h1>

          <p className="text-lg text-[var(--color-text-secondary)] max-w-md">
            Nowoczesny system rezerwacji sal dla Twojego wydziału.
            Zarezerwuj przestrzeń jednym kliknięciem.
          </p>

          {/* Feature List */}
          <div className="mt-12 space-y-4">
            {[
              'Interaktywny plan pięter',
              'Rezerwacje w czasie rzeczywistym',
              'Widok kalendarza',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)]" />
                <span className="text-[var(--color-text-secondary)]">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-heading)]">
              Zaloguj się
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Wprowadź dane logowania
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Wprowadź hasło"
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
              Zaloguj się
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-[var(--color-text-secondary)]">Nie masz konta? </span>
            <Link
              href="/register"
              className="text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] font-medium transition-colors"
            >
              Zarejestruj się
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
