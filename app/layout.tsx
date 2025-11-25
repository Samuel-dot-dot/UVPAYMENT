import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { APP_NAME } from '@/constants';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'UVPayment control center',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">👑</text></svg>',
      },
    ],
  },
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
