'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Settings,
  Package, Layers, Truck, Calendar, Telescope,
  ChevronLeft, Bell, BellOff, MoreHorizontal, X,
} from 'lucide-react'

// ── Push notifications ────────────────────────────────────────────────────────

function usePushNotifications() {
  const [state, setState] = useState<'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('unsubscribed')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported'); return
    }
    if (Notification.permission === 'denied') { setState('denied'); return }
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setState(sub ? 'subscribed' : 'unsubscribed'))
    )
  }, [])

  const subscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { setState('denied'); return }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    })
    await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: sub }) })
    setState('subscribed')
  }

  const unsubscribe = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
      await sub.unsubscribe()
    }
    setState('unsubscribed')
  }

  return { state, subscribe, unsubscribe }
}

// ── Nav config ────────────────────────────────────────────────────────────────

const bottomNav = [
  { href: '/admin',        label: 'Panel',   icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/prep',   label: 'Prep',    icon: ClipboardList },
  { href: '/admin/settings', label: 'Config', icon: Settings },
]

const moreNav = [
  { href: '/admin/products',    label: 'Productos',        icon: Package },
  { href: '/admin/toppings',    label: 'Toppings',         icon: Layers },
  { href: '/admin/delivery',    label: 'Zonas de entrega', icon: Truck },
  { href: '/admin/schedule',    label: 'Horario',          icon: Calendar },
  { href: '/admin/prospector',  label: 'Prospector',       icon: Telescope },
]

const allNav = [
  { href: '/admin',        label: 'Panel',            icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Pedidos',          icon: ShoppingBag },
  { href: '/admin/prep',   label: 'Lista de prep',    icon: ClipboardList },
  { href: '/admin/settings', label: 'Configuración',  icon: Settings },
  { href: '/admin/products',    label: 'Productos',        icon: Package },
  { href: '/admin/toppings',    label: 'Toppings',         icon: Layers },
  { href: '/admin/delivery',    label: 'Zonas de entrega', icon: Truck },
  { href: '/admin/schedule',    label: 'Horario',          icon: Calendar },
  { href: '/admin/prospector',  label: 'Prospector',       icon: Telescope },
]

// ── Shell ─────────────────────────────────────────────────────────────────────

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { state: notifState, subscribe, unsubscribe } = usePushNotifications()
  const [moreOpen, setMoreOpen] = useState(false)

  const isHome = pathname === '/admin'
  const inMore = moreNav.some(n => pathname.startsWith(n.href))

  // Page title from nav
  const currentNav = allNav.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))
  const pageTitle = currentNav?.label ?? 'Admin'

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full"
        style={{ background: 'var(--card)', borderRight: '1.5px solid var(--border)' }}>
        <div style={{ padding: '28px 20px 20px', borderBottom: '1.5px solid var(--border)' }}>
          <span className="font-display font-bold" style={{ fontSize: 20, color: 'var(--rose)' }}>The Bowl House</span>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>Admin</p>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {allNav.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 16, marginBottom: 2,
                  fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  background: active ? 'var(--rose-light)' : 'transparent',
                  color: active ? 'var(--rose-dark)' : 'var(--text-secondary)',
                }}>
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '12px', borderTop: '1.5px solid var(--border)' }}>
          <button
            onClick={notifState === 'subscribed' ? unsubscribe : subscribe}
            disabled={notifState === 'denied' || notifState === 'unsupported'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '10px 12px', borderRadius: 16, border: 'none', background: 'transparent',
              color: notifState === 'subscribed' ? 'var(--rose)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'left',
            }}>
            {notifState === 'subscribed' ? <Bell size={18} /> : <BellOff size={18} />}
            {notifState === 'subscribed' ? 'Notificaciones ON' : notifState === 'denied' ? 'Bloqueado' : 'Activar notifs'}
          </button>
        </div>
      </aside>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100dvh', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 56, flexShrink: 0,
          background: 'var(--card)', borderBottom: '1.5px solid var(--border)',
        }}>
          {!isHome ? (
            <button onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, padding: 0 }}>
              <ChevronLeft size={20} /> Atrás
            </button>
          ) : (
            <span className="font-display font-bold" style={{ fontSize: 17, color: 'var(--chocolate)' }}>The Bowl House</span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isHome && (
              <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                {pageTitle}
              </span>
            )}
            <button
              onClick={notifState === 'subscribed' ? unsubscribe : subscribe}
              disabled={notifState === 'denied' || notifState === 'unsupported'}
              title={notifState === 'subscribed' ? 'Notificaciones ON' : 'Activar notifs'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg)',
                color: notifState === 'subscribed' ? 'var(--rose)' : 'var(--text-secondary)',
                cursor: notifState === 'denied' ? 'not-allowed' : 'pointer',
              }}>
              {notifState === 'subscribed' ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          <div style={{ padding: '20px 16px 24px', maxWidth: 680, margin: '0 auto' }}>
            {children}
          </div>
        </div>

        {/* Bottom tab bar */}
        <div style={{
          display: 'flex', alignItems: 'stretch', flexShrink: 0,
          height: 64, background: 'var(--card)',
          borderTop: '1.5px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {bottomNav.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 3, textDecoration: 'none',
                  color: active ? 'var(--rose)' : 'var(--text-secondary)',
                }}>
                <item.icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </Link>
            )
          })}
          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, border: 'none', background: 'transparent', cursor: 'pointer',
              color: inMore ? 'var(--rose)' : 'var(--text-secondary)',
            }}>
            <MoreHorizontal size={22} strokeWidth={inMore ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: inMore ? 700 : 500 }}>Más</span>
          </button>
        </div>
      </div>

      {/* ── Desktop main content ── */}
      <main className="hidden lg:block" style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* ── More drawer (mobile) ── */}
      {moreOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setMoreOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'var(--card)', borderRadius: '24px 24px 0 0',
              padding: '8px 0 calc(24px + env(safe-area-inset-bottom))',
            }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '8px auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 4px' }}>
              <button onClick={() => setMoreOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            {moreNav.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setMoreOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 24px', textDecoration: 'none',
                    background: active ? 'var(--rose-light)' : 'transparent',
                    color: active ? 'var(--rose-dark)' : 'var(--text-primary)',
                    fontWeight: 600, fontSize: 15,
                  }}>
                  <item.icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
