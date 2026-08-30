'use client'

// TODO: Enable Supabase auth before production

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Layers,
  Truck, Calendar, ClipboardList, Settings, Menu, X, Telescope
} from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/toppings', label: 'Toppings', icon: Layers },
  { href: '/admin/delivery', label: 'Zonas de entrega', icon: Truck },
  { href: '/admin/schedule', label: 'Horario', icon: Calendar },
  { href: '/admin/prep', label: 'Lista de prep', icon: ClipboardList },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
  { href: '/admin/prospector', label: 'Prospector', icon: Telescope },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Dev mode banner - remove before production */}
      {process.env.NODE_ENV === 'development' && false && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, textAlign: 'center', padding: '4px', fontSize: 11, fontWeight: 700, background: '#FBBF24', color: '#7C2D12' }}>
          Modo desarrollo — autenticación desactivada
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-0 h-dvh pt-7"
        style={{ background: 'var(--card)', borderRight: '1.5px solid var(--border)' }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="font-display text-xl font-bold" style={{ color: 'var(--rose)' }}>The Bowl House</span>
          <p className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--text-secondary)' }}>Admin</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {nav.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 text-sm font-semibold transition-all"
                style={{
                  background: active ? 'var(--rose-light)' : 'transparent',
                  color: active ? 'var(--rose-dark)' : 'var(--text-secondary)',
                }}>
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden" style={{ position: 'fixed', top: 28, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--card)', borderBottom: '1.5px solid var(--border)' }}>
        <span className="font-display font-bold" style={{ color: 'var(--rose)' }}>The Bowl House</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: 'var(--text-primary)' }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40, paddingTop: 112, background: 'var(--bg)' }}>
          <nav style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {nav.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 18, fontWeight: 600,
                    background: active ? 'var(--rose-light)' : 'var(--card)',
                    color: active ? 'var(--rose-dark)' : 'var(--text-secondary)',
                  }}>
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pt-7" style={{ flex: 1, overflowY: 'auto', paddingTop: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 40px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
