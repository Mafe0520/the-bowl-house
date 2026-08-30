'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, ShoppingBag, ClipboardList } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { useLanguage } from '@/lib/i18n/LanguageContext'

const tabs = [
  { href: '/', icon: Home, labelEs: 'Inicio', labelEn: 'Home' },
  { href: '/menu', icon: UtensilsCrossed, labelEs: 'Menú', labelEn: 'Menu' },
  { href: '/cart', icon: ShoppingBag, labelEs: 'Carrito', labelEn: 'Cart' },
  { href: '/order', icon: ClipboardList, labelEs: 'Pedidos', labelEn: 'Orders' },
]

const NAV_H = 52 // px — compact bottom nav

export function BottomNav() {
  const pathname = usePathname()
  const totalItems = useCart(s => s.totalItems())
  const subtotal = useCart(s => s.subtotal())
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const showViewCart = mounted && totalItems > 0 && pathname !== '/' && pathname !== '/cart' && pathname !== '/checkout' && !pathname.startsWith('/product/') && !pathname.includes('/confirmation')

  return (
    <>
      {/* View Cart pill — floats above nav */}
      {showViewCart && (
        <div
          className="fixed left-0 right-0 z-50"
          style={{
            bottom: `calc(${NAV_H}px + env(safe-area-inset-bottom, 0px) + 10px)`,
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            paddingLeft: 40,
            paddingRight: 40,
          }}
        >
        <Link
          href="/cart"
          className="flex items-center justify-center gap-2 transition-all active:scale-98"
          style={{
            height: 48,
            background: 'var(--chocolate)',
            color: 'white',
            borderRadius: 30,
            maxWidth: 260,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <ShoppingBag size={16} strokeWidth={2.5} />
          <span className="font-display font-bold" style={{ fontSize: 16 }}>
            {lang === 'es' ? 'Ver carrito' : 'View Cart'} · ${subtotal.toFixed(2)}
          </span>
          <span
            className="flex items-center justify-center rounded-full font-bold"
            style={{
              background: 'var(--rose)',
              width: 20,
              height: 20,
              fontSize: 10,
              color: 'white',
              minWidth: 20,
            }}
          >
            {totalItems}
          </span>
        </Link>
        </div>
      )}

      {/* Bottom Nav — slim, discreet */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center"
        style={{
          height: `calc(${NAV_H}px + env(safe-area-inset-bottom, 0px))`,
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {tabs.map(tab => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const label = lang === 'es' ? tab.labelEs : tab.labelEn
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              style={{ height: NAV_H }}
            >
              <Icon
                size={20}
                style={{ color: isActive ? 'var(--rose)' : 'var(--text-secondary)', strokeWidth: isActive ? 2.5 : 1.8 }}
              />
              <span
                className="font-body"
                style={{
                  fontSize: 10,
                  color: isActive ? 'var(--rose)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
