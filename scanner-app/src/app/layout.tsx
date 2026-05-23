import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkTik Scanner',
  description: 'Offline-capable QR code ticket scanner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
