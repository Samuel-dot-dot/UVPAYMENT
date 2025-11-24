import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { APP_NAME } from '@/constants';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'UVPayment control center',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-void text-slate-200 font-sans selection:bg-electric-violet selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
