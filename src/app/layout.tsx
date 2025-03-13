import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthProvider from '@/providers/AuthProvider';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#c5b3fe',
};

export const metadata: Metadata = {
  title: 'Sola AI',
  description: 'Voice Assistant on Solana',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sola AI',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/pwa-180x180.png"></link>
        <title>Sola AI</title>
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
