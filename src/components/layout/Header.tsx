'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Markets', href: '/markets' },
  { label: 'Countries', href: '/countries' },
  { label: 'Sectors', href: '/sectors' },
  { label: 'Portfolio', href: '/portfolio' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const today = format(new Date(), "EEEE, d MMMM yyyy")

  return (
    <header className="bg-cream border-b border-ink/10">
      {/* Top gold rule */}
      <div className="h-[3px] bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0" />

      {/* Masthead */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* Date line */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[0.65rem] tracking-[0.1em] text-ink/50 uppercase"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            {today} · Vol. 1, No. 1
          </span>
          <span
            className="text-[0.65rem] tracking-[0.1em] text-ink/50 uppercase"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            Est. 2025 · For the African Diaspora Investor
          </span>
        </div>

        {/* Title block */}
        <div className="text-center py-3">
          <Link href="/" className="inline-block group">
            <h1
              className="masthead-title text-[2.25rem] sm:text-[3rem] lg:text-[3.75rem] tracking-[0.08em] text-ink"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Africa Finance Review
            </h1>
            <div className="h-[2px] bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0 mt-1 group-hover:opacity-80 transition-opacity" />
          </Link>
          <p
            className="mt-2 text-[0.6875rem] tracking-[0.14em] text-ink/50 uppercase"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            Investment Intelligence Across the Continent
          </p>
        </div>
      </div>

      {/* Bottom gold rule */}
      <div className="h-px bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C]/40 to-[#C9A84C]/0" />

      {/* Nav bar */}
      <nav className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase text-ink/70 hover:text-ink border-b-2 border-transparent hover:border-[#C9A84C] transition-all duration-150"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {/* Search */}
            <button
              aria-label="Search"
              className="p-2 text-ink/50 hover:text-[#C9A84C] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>

            {/* Subscribe CTA */}
            <Link
              href="/subscribe"
              className="px-4 py-1.5 bg-[#C9A84C] text-white text-[0.625rem] font-semibold tracking-[0.12em] uppercase hover:bg-[#A07830] transition-colors"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-2 text-ink/60 hover:text-ink"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink/10 bg-cream animate-slide-down">
          <div className="max-w-8xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-[0.75rem] font-semibold tracking-wider uppercase text-ink/70 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 rounded transition-colors"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-ink/10 mt-2 pt-3">
              <Link
                href="/subscribe"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2 bg-[#C9A84C] text-white text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Thick bottom rule */}
      <div className="h-[3px] bg-ink" />
    </header>
  )
}
