'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b bg-card text-card-foreground">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Habit Manager
        </Link>

        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-muted-foreground hover:text-primary">
            Entrar
          </button>
        </div>
      </div>
    </nav>
  );
}
