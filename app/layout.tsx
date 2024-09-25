'use client';

import { SessionProvider } from 'next-auth/react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <header>
            <h1>Blind Test de Musique Classique</h1>
          </header>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
