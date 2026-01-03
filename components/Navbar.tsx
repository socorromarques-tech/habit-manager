'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-card text-card-foreground">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Habit Manager
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Olá, {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
