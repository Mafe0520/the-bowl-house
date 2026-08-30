'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-store'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight } from 'lucide-react'
import { CartItemSelection } from '@/types'

function groupSelections(selections: CartItemSelection[]) {
  const map = new Map<string, CartItemSelection[]>()
  for (const sel of selections) {
    const arr = map.get(sel.group_id) || []
    arr.push(sel)
    map.set(sel.group_id, arr)
  }
  return map
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  const { t, lang } = useLanguage()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 text-center"
        style={{ minHeight: 'calc(100vh - 54px - 52px)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--rose-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <ShoppingBag size={32} style={{ color: 'var(--rose)' }} />
        </div>
        <h1 className="font-display font-bold mb-2" style={{ fontSize: 22, color: 'var(--chocolate)' }}>
          {t.cartEmpty}
        </h1>
        <p className="font-body mb-8" style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 240 }}>
          {t.cartEmptySub}
        </p>
        <Link href="/menu">
          <div className="inline-flex items-center justify-center gap-1.5 font-display font-bold text-white rounded-2xl px-7"
            style={{ height: 48, fontSize: 16, background: 'var(--rose)' }}>
            {t.browseMenu}
            <ChevronRight size={16} strokeWidth={2.5} />
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 'calc(52px + env(safe-area-inset-bottom, 0px) + 88px)' }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px' }}>
        <h1 className="font-display font-bold" style={{ fontSize: 24, color: 'var(--chocolate)' }}>
          {t.cartTitle}
        </h1>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', gap: 10 }}>
        {items.map(item => {
          const includedSels = item.selections ? item.selections.filter(s => s.price === 0) : []
          const extraSels = item.selections ? item.selections.filter(s => s.price > 0) : []
          const selectionsText = Array.from(groupSelections(includedSels))
            .map(([, opts]) => opts.map(o => o.option_name).join(', '))
            .join(' · ')

          return (
            <div
              key={item.id}
              style={{
                background: 'var(--card)',
                borderRadius: 18,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {/* Top row: image + name + delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                <div
                  className="relative flex-shrink-0 rounded-xl overflow-hidden"
                  style={{ width: 64, height: 64, background: 'var(--cream-dark)' }}
                >
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                      style={{ padding: '6px' }}
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold"
                      style={{ color: 'var(--rose)', fontSize: 20 }}>
                      {item.product.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)', lineHeight: 1.2 }}>
                    {item.product.name}
                  </p>
                  {selectionsText ? (
                    <p className="font-body mt-0.5" style={{
                      fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.35,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    } as React.CSSProperties}>
                      {selectionsText}
                    </p>
                  ) : null}
                  {extraSels.length > 0 && (
                    <p className="font-body mt-0.5" style={{ fontSize: 12, color: 'var(--caramel)', fontWeight: 600 }}>
                      +{extraSels.map(e => e.option_name).join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 32, height: 32, background: 'var(--cream-dark)', color: 'var(--text-secondary)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Bottom row: qty + price */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid var(--border)', background: 'var(--cream-dark)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 32, height: 32, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--chocolate)' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)', width: 20, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 32, height: 32, background: 'var(--rose)', color: 'white' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--rose)' }}>
                  ${item.itemTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals card */}
      <div
        style={{
          margin: '16px 16px 0',
          background: 'var(--card)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.subtotal}</span>
          <span className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>
            ${subtotal().toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <span className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.deliveryFee}</span>
          <span className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.deliveryFeeNote}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--rose-light)' }}>
          <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)' }}>{t.total}</span>
          <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--rose-dark)' }}>
            ${subtotal().toFixed(2)}+
          </span>
        </div>
      </div>

      {/* CTA */}
      <div
        className="fixed left-0 right-0"
        style={{
          bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))',
          padding: '10px 16px 10px',
          background: 'linear-gradient(to top, var(--cream) 80%, transparent)',
        }}
      >
        <Link href="/checkout">
          <div
            className="w-full font-display font-bold text-white flex items-center justify-center gap-2 rounded-2xl"
            style={{ height: 54, fontSize: 17, background: 'var(--chocolate)' }}
          >
            {t.checkout(subtotal().toFixed(2))}
            <ChevronRight size={18} strokeWidth={2.5} />
          </div>
        </Link>
      </div>
    </div>
  )
}
