'use client'

import { useEffect, useState } from 'react'

interface TickerItem {
  label: string
  value: string
  change?: number
}

const FALLBACK_ITEMS: TickerItem[] = [
  { label: 'NGX', value: '+1.24%', change: 1.24 },
  { label: 'JSE', value: '+0.67%', change: 0.67 },
  { label: 'GSE', value: '+2.11%', change: 2.11 },
  { label: 'NSE', value: '-0.38%', change: -0.38 },
  { label: 'EGX', value: '+0.95%', change: 0.95 },
  { label: 'CASE', value: '-0.12%', change: -0.12 },
  { label: 'DSE', value: '+0.44%', change: 0.44 },
  { label: 'LuSE', value: '+0.21%', change: 0.21 },
  { label: 'USD/NGN', value: '1,612.00', change: 0 },
  { label: 'USD/KES', value: '129.50', change: 0 },
  { label: 'USD/GHS', value: '15.80', change: 0 },
  { label: 'USD/ZAR', value: '18.42', change: -0.3 },
  { label: 'USD/EGP', value: '48.90', change: 0 },
  { label: 'GOLD', value: '+0.78%', change: 0.78 },
  { label: 'CRUDE OIL', value: '-0.45%', change: -0.45 },
  { label: 'COCOA', value: '+1.32%', change: 1.32 },
  { label: 'COPPER', value: '+0.56%', change: 0.56 },
]

function getItemColor(item: TickerItem): string {
  if (item.change === undefined || item.change === 0) return 'text-[#C9A84C]'
  if (item.change > 0) return 'text-[#4ade80]'
  return 'text-[#f87171]'
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_ITEMS)

  useEffect(() => {
    fetch('/api/market/ticker')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items)
        }
      })
      .catch(() => {
        // use fallback
      })
  }, [])

  // Duplicate for seamless infinite scroll
  const doubled = [...items, ...items]

  return (
    <div
      className="bg-[#1a1a1a] border-b border-[#C9A84C]/20 overflow-hidden"
      style={{ height: '32px' }}
      aria-label="Live market ticker"
    >
      <div className="flex items-center h-full">
        {/* Label */}
        <div className="flex-shrink-0 px-3 border-r border-[#C9A84C]/30 h-full flex items-center">
          <span
            className="text-[#C9A84C] font-ui text-[0.6rem] font-semibold tracking-[0.12em] uppercase"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            Live Markets
          </span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden h-full flex items-center">
          <div className="ticker-track">
            {doubled.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 mx-4"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                <span className="text-[#888888] text-[0.65rem] font-semibold tracking-wider uppercase">
                  {item.label}
                </span>
                <span className={`text-[0.65rem] font-semibold ${getItemColor(item)}`}>
                  {item.change !== undefined && item.change > 0 && '▲ '}
                  {item.change !== undefined && item.change < 0 && '▼ '}
                  {item.value}
                </span>
                <span className="text-[#444444] text-[0.5rem]">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
