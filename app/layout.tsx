import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { APP_NAME } from '@/constants';

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: 'Premium video streaming platform with exclusive content. Subscribe to access unlimited videos and premium features.',
  keywords: ['video streaming', 'premium content', 'subscription', 'exclusive videos', 'UVPayment'],
  authors: [{ name: 'UVPayment' }],
  creator: 'UVPayment',
  publisher: 'UVPayment',
  metadataBase: new URL('https://www.uvpayment.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.uvpayment.com',
    title: APP_NAME,
    description: 'Premium video streaming platform with exclusive content. Subscribe to access unlimited videos and premium features.',
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: 'Premium video streaming platform with exclusive content. Subscribe to access unlimited videos and premium features.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
