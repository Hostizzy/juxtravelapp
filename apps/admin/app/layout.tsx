import type { Metadata } from 'next';
import QueryProvider from '../components/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'JuxTravel Admin',
  description: 'JuxTravel Admin Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
