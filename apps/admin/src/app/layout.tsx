import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';
import { AdminShell } from '@/components/ui/AdminNav';

export const metadata: Metadata = {
  title: { default: 'Admin — Udyoga Sakha', template: '%s | Admin' },
  description: 'Moderation and administration portal for Udyoga Sakha.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {/* AdminShell decides whether to show the sidebar based on the route */}
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  );
}
