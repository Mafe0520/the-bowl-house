'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Order } from '@/types'
import { formatTime } from '@/lib/delivery-capacity'

export default function LabelPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`)
    setOrder(await res.json())
  }, [id])

  useEffect(() => { load() }, [load])

  if (!order) return null

  const o = order as Order & {
    total?: number
    street_address?: string
    apartment?: string
    city?: string
    state?: string
    zip_code?: string
    payment_method?: string
    delivery_slot?: { start_time?: string; end_time?: string }
    delivery_date?: { date?: string }
  }

  const items = (order as unknown as { order_items?: unknown[]; items?: unknown[] }).order_items || (order as unknown as { items?: unknown[] }).items || []
  const isZelle = o.payment_method === 'zelle'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: #f5f5f5; }

        .print-btn {
          display: block;
          margin: 12px auto;
          padding: 10px 28px;
          background: #000;
          color: white;
          border: none;
          border-radius: 20px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .label {
          width: 3in;
          height: 3in;
          background: white;
          display: grid;
          grid-template-columns: 45% 55%;
          overflow: hidden;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          margin: 0 auto;
        }

        /* ── LEFT ── */
        .col-left {
          display: flex;
          flex-direction: column;
          padding: 0.1in 0.08in 0.1in 0.1in;
          border-right: 1px solid #ccc;
          overflow: hidden;
        }

        .pedido-label {
          font-size: 7pt;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #000;
          line-height: 1;
          margin-bottom: 0;
        }

        .order-num {
          font-size: 18pt;
          font-weight: 900;
          color: #000;
          line-height: 1;
          margin-bottom: 4pt;
        }

        .heart-divider {
          font-size: 6pt;
          color: #000;
          letter-spacing: 2pt;
          margin-bottom: 4pt;
          overflow: hidden;
          white-space: nowrap;
        }

        .customer-name {
          font-size: 10pt;
          font-weight: 900;
          color: #000;
          line-height: 1.1;
          margin-bottom: 3pt;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .address-row {
          display: flex;
          align-items: flex-start;
          gap: 3pt;
          margin-bottom: 4pt;
        }

        .address-icon {
          font-size: 7pt;
          margin-top: 0.5pt;
          flex-shrink: 0;
        }

        .address-text {
          font-size: 6.5pt;
          color: #333;
          line-height: 1.35;
        }

        .zelle-section {
          margin-top: auto;
        }

        .zelle-title {
          font-size: 6.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 3pt;
          border-top: 1px dashed #999;
          padding-top: 4pt;
        }

        .zelle-row {
          display: flex;
          align-items: center;
          gap: 5pt;
        }

        .zelle-info {
          font-size: 6.5pt;
          color: #333;
          line-height: 1.5;
        }

        /* ── RIGHT ── */
        .col-right {
          display: flex;
          flex-direction: column;
          padding: 0.08in 0.1in 0.1in 0.08in;
          overflow: hidden;
        }

        .logo-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          padding: 4pt 0;
        }

        .section-divider {
          font-size: 6pt;
          text-align: center;
          color: #000;
          letter-spacing: 1pt;
          border-top: 1px solid #000;
          padding-top: 3pt;
          margin-bottom: 3pt;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 6.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          text-align: center;
          margin-bottom: 4pt;
          flex-shrink: 0;
        }

        .item-name {
          font-size: 8.5pt;
          font-weight: 800;
          color: #000;
          line-height: 1.1;
          margin-bottom: 1pt;
        }

        .item-sels {
          font-size: 6.5pt;
          color: #555;
          font-style: italic;
          margin-bottom: 3pt;
          line-height: 1.2;
        }

        .total-divider {
          border-top: 1px solid #000;
          padding-top: 3pt;
          margin-top: auto;
          flex-shrink: 0;
        }

        .total {
          font-size: 20pt;
          font-weight: 900;
          color: #000;
          line-height: 1;
          text-align: center;
        }

        @media print {
          @page { size: 3in 3in; margin: 0; }
          html, body { background: white; }
          body * { visibility: hidden; }
          .label, .label * { visibility: visible; }
          .label { position: fixed; top: 0; left: 0; width: 3in; height: 3in; box-shadow: none; }
          .print-btn { display: none; }
        }
      `}</style>

      <button className="print-btn" onClick={() => window.print()}>Imprimir label</button>

      <div className="label">

        {/* ── LEFT COLUMN ── */}
        <div className="col-left">
          <div className="pedido-label">Pedido</div>
          <div className="order-num">#{order.order_number}</div>

          <div className="heart-divider">- - ♥ - - - - - - - - -</div>

          <div className="customer-name">{order.customer_first_name} {order.customer_last_name}</div>

          {o.fulfillment_type === 'delivery' && o.street_address && (
            <div className="address-row">
              <span className="address-icon">📍</span>
              <div className="address-text">
                {o.street_address}{o.apartment ? `, ${o.apartment}` : ''}<br />
                {o.city}, {o.state} {o.zip_code}
              </div>
            </div>
          )}
          {o.fulfillment_type === 'pickup' && (
            <div className="address-row">
              <span className="address-icon">🏪</span>
              <div className="address-text">Pick-up en tienda</div>
            </div>
          )}

          {(o.delivery_slot?.start_time || o.delivery_slot?.end_time) && (
            <div className="address-row">
              <span className="address-icon">🕐</span>
              <div className="address-text">
                {o.delivery_date?.date && (
                  <>{new Date(o.delivery_date.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'short', month: 'short', day: 'numeric' })}<br /></>
                )}
                {o.delivery_slot?.start_time ? formatTime(o.delivery_slot.start_time) : ''}{o.delivery_slot?.end_time ? ` – ${formatTime(o.delivery_slot.end_time)}` : ''}
              </div>
            </div>
          )}

          {isZelle ? (
            <div className="zelle-section">
              <div className="zelle-title">Pagar con Zelle</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/zelle-qr.jpg?v=2" alt="Zelle QR" style={{ width: '78pt', height: '78pt', objectFit: 'contain', display: 'block', border: '1px solid #ccc', borderRadius: '4pt', padding: '2pt', marginBottom: '3pt' }} />
              <div className="zelle-info">Maria · 862-220-8056</div>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0, borderTop: '1px dashed #999', paddingTop: '4pt', margin: '0 -0.08in 0 -0.1in', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cash.png" alt="Efectivo" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-right">
          <div className="logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-negro.png" alt="The Bowl House" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div className="section-divider">♥</div>
          <div className="section-title">♥ Lo que ordenó ♥</div>

          {items.map((item, i) => (
            <div key={i}>
              <div className="item-name">{item.product_name} ×{item.quantity}</div>
              {item.selections && item.selections.length > 0 && (
                <div className="item-sels">
                  {item.selections.map((s: { option_name: string }) => s.option_name).join(' + ')}
                </div>
              )}
            </div>
          ))}

          <div className="total-divider">
            <div className="total">$ {Number(o.total ?? 0).toFixed(2)}</div>
          </div>
        </div>

      </div>
    </>
  )
}
