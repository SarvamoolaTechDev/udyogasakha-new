import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Navbar } from '@/components/ui/Navbar';
import { BubbleCanvas } from '@/components/ui/BubbleCanvas';
import { InactivityTimer } from '@/components/ui/InactivityTimer';

export const metadata: Metadata = {
  title: { default:'Sarvamoola Udyoga Sakha', template:'%s | Udyoga Sakha' },
  description:"India's unified employment ecosystem — 11 role types across IT, Non-IT and Services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <BubbleCanvas />
          <Navbar />
          <InactivityTimer />
          <main style={{ position:'relative', zIndex:1 }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
