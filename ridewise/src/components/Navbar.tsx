'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/book', label: 'Book Ride' },
    { href: '/ride', label: 'Ride Status' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0B1220]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-2.5 w-2.5 rounded-full bg-[#2563EB] group-hover:scale-110 transition-transform" />
          <span className="text-base font-semibold tracking-tight text-white">
            RideWise <span className="text-[#2563EB]">AI</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#111C30]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
