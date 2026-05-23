import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkTik - QR Code & Link Management',
  description: 'Shorten links, generate QR codes, and sell event tickets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
