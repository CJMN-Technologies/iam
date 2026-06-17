import type { Metadata } from 'next';
import '../frontend/styles/index.css';

export const metadata: Metadata = {
  title: 'Group 11 Superadmin',
  description: 'Superadmin Dashboard',
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
