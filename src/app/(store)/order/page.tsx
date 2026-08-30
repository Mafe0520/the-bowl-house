'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, Search } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function OrdersPage() {
  const { lang } = useLanguage()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')

  function handleSearch() {
    const trimmed = orderNumber.trim().toUpperCase()
    if (trimmed) router.push(`/order/${trimmed}/confirmation`)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100dvh - 54px - 52px)',
        padding: '0 24px',
        textAlign: 'center',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--rose-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <ClipboardList size={32} style={{ color: 'var(--rose)' }} />
      </div>

      <h1 className="font-display font-bold" style={{ fontSize: 22, color: 'var(--chocolate)', marginBottom: 8 }}>
        {lang === 'es' ? 'Mis pedidos' : 'My Orders'}
      </h1>
      <p className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 260, marginBottom: 28, lineHeight: 1.5 }}>
        {lang === 'es'
          ? 'Ingresa tu número de pedido para ver el estado de tu entrega.'
          : 'Enter your order number to check your delivery status.'}
      </p>

      {/* Search */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <input
          type="text"
          value={orderNumber}
          onChange={e => setOrderNumber(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder={lang === 'es' ? 'Ej. TBH-001' : 'e.g. TBH-001'}
          className="font-body"
          style={{
            width: '100%',
            height: 50,
            borderRadius: 16,
            border: '1.5px solid var(--border)',
            background: 'var(--card)',
            fontSize: 16,
            color: 'var(--chocolate)',
            textAlign: 'center',
            outline: 'none',
            marginBottom: 12,
            letterSpacing: '0.05em',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!orderNumber.trim()}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 16,
            background: orderNumber.trim() ? 'var(--rose)' : 'var(--cream-dark)',
            color: orderNumber.trim() ? 'white' : 'var(--text-secondary)',
            fontSize: 16,
            fontFamily: 'inherit',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: orderNumber.trim() ? 'pointer' : 'default',
          }}
        >
          <Search size={16} />
          {lang === 'es' ? 'Buscar pedido' : 'Search order'}
        </button>
      </div>
    </div>
  )
}
