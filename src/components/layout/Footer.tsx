import Link from 'next/link'

const COVERAGE_LINKS = [
  { label: 'Nigeria', href: '/country/NG' },
  { label: 'Kenya', href: '/country/KE' },
  { label: 'South Africa', href: '/country/ZA' },
  { label: 'Ghana', href: '/country/GH' },
  { label: 'Egypt', href: '/country/EG' },
  { label: 'Morocco', href: '/country/MA' },
  { label: 'All Markets', href: '/markets' },
]

const SECTOR_LINKS = [
  { label: 'Banking', href: '/sector/banking' },
  { label: 'Telecoms', href: '/sector/telecoms' },
  { label: 'Energy', href: '/sector/energy' },
  { label: 'Agriculture', href: '/sector/agriculture' },
  { label: 'Technology', href: '/sector/technology' },
  { label: 'Infrastructure', href: '/sector/infrastructure' },
]

const COMPANY_LINKS = [
  { label: 'About AFR', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Subscribe', href: '/subscribe' },
  { label: 'Newsletter', href: '/newsletter' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Cookie Policy', href: '/cookies' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1a1a1a] text-[#FAFAF7] mt-16">
      {/* Top gold rule */}
      <div className="h-[3px] bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0" />

      {/* Main footer grid */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span
                className="text-2xl font-bold tracking-[0.05em] uppercase text-[#FAFAF7]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Africa Finance Review
              </span>
            </Link>
            <div className="h-[2px] w-16 bg-[#C9A84C] mb-4" />
            <p
              className="text-[0.8125rem] text-[#888888] leading-relaxed mb-4 max-w-xs"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              The continent's premier source of investment intelligence.
              Curated analysis, real-time market data, and diaspora-focused
              insights across Africa's 54 markets.
            </p>
            <p
              className="text-[0.6875rem] text-[#C9A84C] tracking-[0.1em] uppercase font-semibold mb-6"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              For the African Diaspora Investor
            </p>

            {/* Subscribe CTA */}
            <div className="space-y-2">
              <p
                className="text-[0.6875rem] text-[#AAAAAA] tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Stay ahead of the market
              </p>
              <Link
                href="/subscribe"
                className="inline-block px-5 py-2 border border-[#C9A84C] text-[#C9A84C] text-[0.6875rem] font-semibold tracking-[0.1em] uppercase hover:bg-[#C9A84C] hover:text-[#1a1a1a] transition-colors"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Subscribe Now
              </Link>
            </div>
          </div>

          {/* Coverage column */}
          <div>
            <h3
              className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C] border-b border-[#C9A84C]/20 pb-2 mb-4"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Coverage
            </h3>
            <ul className="space-y-2">
              {COVERAGE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-[#AAAAAA] hover:text-[#C9A84C] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3
              className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C] border-b border-[#C9A84C]/20 pb-2 mb-4 mt-6"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Sectors
            </h3>
            <ul className="space-y-2">
              {SECTOR_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-[#AAAAAA] hover:text-[#C9A84C] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3
              className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C] border-b border-[#C9A84C]/20 pb-2 mb-4"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-[#AAAAAA] hover:text-[#C9A84C] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3
              className="text-[0.6rem] font-semibold tracking-[0.14em] uppercase text-[#C9A84C] border-b border-[#C9A84C]/20 pb-2 mb-4"
              style={{ fontFamily: 'var(--font-ui)' }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-[#AAAAAA] hover:text-[#C9A84C] transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-3 border border-[#C9A84C]/20 bg-[#C9A84C]/5 rounded-sm">
              <p
                className="text-[0.65rem] text-[#888888] leading-relaxed"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <strong className="text-[#AAAAAA]">Disclaimer:</strong> Content is
                for informational purposes only. Not financial advice. Past
                performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#333333]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-[0.65rem] text-[#555555]"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            © {year} Africa Finance Review. All rights reserved.
          </p>
          <div className="ornament-divider hidden sm:flex">
            <span className="text-[#C9A84C]/40 text-[0.6rem]">❧</span>
          </div>
          <p
            className="text-[0.65rem] text-[#555555] italic"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            "Africa is not poor, it is poorly managed." — Mo Ibrahim
          </p>
        </div>
      </div>
    </footer>
  )
}
