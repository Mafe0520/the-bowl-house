'use client'

// TODO: Enable Supabase auth before production

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Layers,
  Truck, Calendar, ClipboardList, Settings, Menu, X, Telescope, Bell, BellOff, ChevronLeft
} from 'lucide-react'

function usePushNotifications() {
  const [state, setState] = useState<'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('unsubscribed')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setState(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  const subscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { setState('denied'); return }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    })
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub }),
    })
    setState('subscribed')
  }

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setState('unsubscribed')
  }

  return { state, subscribe, unsubscribe }
}

function NotifButton({ compact = false }: { compact?: boolean }) {
  const { state, subscribe, unsubscribe } = usePushNotifications()
  if (state === 'unsupported') return null

  const label = state === 'subscribed' ? 'Notificaciones ON' : state === 'denied' ? 'Bloqueado' : 'Activar notifs'
  const Icon = state === 'subscribed' ? Bell : BellOff
  const color = state === 'subscribed' ? 'var(--rose)' : 'var(--text-secondary)'

  if (compact) {
    return (
      <button
        onClick={state === 'subscribed' ? unsubscribe : subscribe}
        disabled={state === 'denied'}
        title={label}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--card)', color, cursor: state === 'denied' ? 'not-allowed' : 'pointer' }}>
        <Icon size={16} />
      </button>
    )
  }

  return (
    <button
      onClick={state === 'subscribed' ? unsubscribe : subscribe}
      disabled={state === 'denied'}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 16, border: 'none', background: 'transparent', color, fontWeight: 600, fontSize: 13, cursor: state === 'denied' ? 'not-allowed' : 'pointer', textAlign: 'left' }}>
      <Icon size={18} />
      {label}
    </button>
  )
}

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
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isHome = pathname === '/admin'

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
        <div className="px-3 pb-5 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          <NotifButton />
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden" style={{ position: 'fixed', top: 28, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--card)', borderBottom: '1.5px solid var(--border)' }}>
        {!isHome ? (
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
            <ChevronLeft size={20} /> Atrás
          </button>
        ) : (
          <span className="font-display font-bold" style={{ color: 'var(--rose)' }}>The Bowl House</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotifButton compact />
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: 'var(--text-primary)' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
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
