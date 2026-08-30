'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart-store'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ShoppingBag } from 'lucide-react'

export function StoreNav() {
  const totalItems = useCart(s => s.totalItems())
  const { lang, setLang, t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between"
      style={{
        height: 54,
        background: 'var(--cream)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
      }}
    >
      {/* Logo + wordmark */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="The Bowl House" width={30} height={30} style={{ objectFit: 'contain' }} priority />
        <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)', lineHeight: 1 }}>
          The Bowl House
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Language pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--cream-dark)',
            borderRadius: 20,
            padding: 3,
          }}
        >
          {(['en', 'es'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="font-body font-bold transition-all"
              style={{
                height: 24,
                width: 32,
                borderRadius: 16,
                fontSize: 11,
                letterSpacing: '0.04em',
                background: lang === l ? 'var(--rose)' : 'transparent',
                color: lang === l ? 'white' : 'var(--text-secondary)',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Cart icon — clean, no heavy circle */}
        <Link
          href="/cart"
          className="relative flex items-center justify-center"
          aria-label={t.cart}
          style={{ width: 36, height: 36 }}
        >
          <ShoppingBag size={22} style={{ color: 'var(--chocolate)', strokeWidth: 1.8 }} />
          {mounted && totalItems > 0 && (
            <span
              className="absolute flex items-center justify-center font-bold rounded-full"
              style={{
                top: -1,
                right: -3,
                width: 16,
                height: 16,
                fontSize: 9,
                background: 'var(--rose)',
                color: 'white',
              }}
            >
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
