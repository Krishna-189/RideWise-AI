import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import DemoDisclaimer from '@/components/DemoDisclaimer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RideWise AI — Autonomous Mobility Dispatch & Recovery',
  description:
    'RideWise AI mobility platform with smart sentence booking, fare calculation, fleet capacity matching, and autonomous driver cancellation recovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0B1220] text-white font-sans selection:bg-[#2563EB]/40 selection:text-white">
        <DemoDisclaimer />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-[#1E293B]/60">
          Prototype with simulated drivers and fares
        </footer>
      </body>
    </html>
  );
}
