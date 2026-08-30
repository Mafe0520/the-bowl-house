'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-store'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { DeliveryDate, DeliverySlot } from '@/types'
import { formatTime } from '@/lib/delivery-capacity'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display font-bold mb-3" style={{ fontSize: 16, color: 'var(--chocolate)' }}>
      {children}
    </p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-body font-semibold mb-1 block" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
      {children}
    </label>
  )
}

function StyledInput({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <FieldLabel>{label}{required && ' *'}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="font-body"
        style={{
          width: '100%',
          height: 48,
          borderRadius: 16,
          border: '1.5px solid var(--border)',
          background: 'var(--card)',
          fontSize: 16,
          color: 'var(--chocolate)',
          outline: 'none',
          paddingLeft: 16,
          paddingRight: 16,
        }}
      />
    </div>
  )
}

function CTAButton({ children, onClick, disabled, loading }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full font-display font-bold text-white flex items-center justify-center rounded-2xl transition-transform active:scale-98"
      style={{
        height: 52,
        fontSize: 18,
        background: disabled || loading ? 'var(--cream-dark)' : 'var(--rose)',
        color: disabled || loading ? 'var(--text-secondary)' : 'white',
      }}
    >
      {loading ? '...' : children}
    </button>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { lang, t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const [street, setStreet] = useState('')
  const [apt, setApt] = useState('')
  const [city, setCity] = useState('')
  const [stateField, setStateField] = useState('')
  const [zip, setZip] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [addressError, setAddressError] = useState('')
  const [zoneId, setZoneId] = useState<string | null>(null)

  const [step, setStep] = useState<'info' | 'address' | 'schedule' | 'payment'>('info')
  const [deliveryDates, setDeliveryDates] = useState<DeliveryDate[]>([])
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<{ slot: DeliverySlot; available: boolean }[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'cash' | null>(null)

  const [mounted, setMounted] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && items.length === 0 && !orderPlaced) router.replace('/menu')
  }, [mounted, items.length, router, orderPlaced])

  if (!mounted) return null
  if (items.length === 0) return null

  async function validateAddress() {
    if (!street || !city) { setAddressError(t.addressRequired); return false }
    setLoading(true)
    try {
      const res = await fetch('/api/delivery/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, zip_code: zip }),
      })
      const data = await res.json()
      if (data.valid) { setZoneId(data.zone_id); setAddressError(''); return true }
      else { setAddressError(t.addressError); return false }
    } catch {
      setAddressError(t.addressErrorGeneric); return false
    } finally {
      setLoading(false)
    }
  }

  async function loadSchedule(validatedZoneId?: string | null) {
    setLoading(true)
    try {
      const res = await fetch(`/api/delivery/dates?type=delivery${validatedZoneId ? `&zone_id=${validatedZoneId}` : ''}`)
      const data = await res.json()
      setDeliveryDates(data.dates || [])
      if (data.delivery_fee) setDeliveryFee(parseFloat(data.delivery_fee))
    } catch {}
    setLoading(false)
  }

  async function loadSlots(dateId: string) {
    setSelectedDateId(dateId)
    setSelectedSlotId(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/delivery/slots?date_id=${dateId}&type=delivery${zoneId ? `&zone_id=${zoneId}` : ''}`)
      const data = await res.json()
      setAvailableSlots(data.slots || [])
    } catch {}
    setLoading(false)
  }

  async function handleAddressNext() {
    setError('')
    const ok = await validateAddress()
    if (!ok) return
    await loadSchedule(zoneId)
    setStep('schedule')
  }

  async function handlePlaceOrder() {
    if (!paymentMethod) { setError(t.selectPayment); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { first_name: firstName, last_name: lastName, phone },
          items: items.map(i => ({
            product_id: i.product.id,
            product_name: i.product.name,
            product_price: i.product.price,
            quantity: i.quantity,
            item_total: i.itemTotal,
            toppings: i.toppings.map(tp => ({
              topping_id: tp.id,
              topping_name: tp.name,
              topping_price: tp.price,
              is_free: tp.is_free,
            })),
          })),
          fulfillment_type: 'delivery',
          delivery_date_id: selectedDateId,
          delivery_slot_id: selectedSlotId,
          pickup_slot_id: null,
          street_address: street,
          apartment: apt,
          city,
          state: stateField,
          zip_code: zip,
          delivery_instructions: deliveryInstructions,
          delivery_zone_id: zoneId,
          subtotal: subtotal(),
          delivery_fee: deliveryFee,
          total: subtotal() + deliveryFee,
          payment_method: paymentMethod,
          preferred_language: lang,
        }),
      })
      const data = await res.json()
      if (data.order_number) {
        setOrderPlaced(true)
        clearCart()
        router.push(`/order/${data.order_number}/confirmation`)
      } else {
        setError(data.error || t.orderFailed)
      }
    } catch {
      setError(t.networkError)
    }
    setLoading(false)
  }

  const total = subtotal() + deliveryFee
  const dateLocale = lang === 'es' ? 'es-US' : 'en-US'

  const STEPS = ['info', 'address', 'schedule', 'payment'] as const
  const stepIndex = STEPS.indexOf(step)
  const stepLabels = lang === 'es'
    ? ['Tus datos', 'Dirección', 'Horario', 'Pago']
    : ['Your info', 'Address', 'Schedule', 'Payment']

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 112px' }}>

      {/* Step progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 flex-1 last:flex-none">
            <div
              className="flex flex-col items-center"
              style={{ flexShrink: 0 }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < stepIndex ? 'var(--chocolate)' : i === stepIndex ? 'var(--rose)' : 'var(--cream-dark)',
                color: i <= stepIndex ? 'white' : 'var(--text-secondary)',
              }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, marginTop: 2, color: i === stepIndex ? 'var(--rose)' : 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {stepLabels[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ height: 2, flex: 1, background: i < stepIndex ? 'var(--chocolate)' : 'var(--border)', marginBottom: 12, borderRadius: 1 }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Info step ─────────────────────────────────── */}
      {step === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionLabel>{t.yourInfo}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StyledInput label={t.firstName} value={firstName} onChange={e => setFirstName(e.target.value)} required />
            <StyledInput label={t.lastName} value={lastName} onChange={e => setLastName(e.target.value)} required />
            <StyledInput label={t.phone} type="tel" value={phone} onChange={e => setPhone(e.target.value)} required  />
          </div>
          {error && <p className="text-sm text-center font-medium" style={{ color: '#DC2626' }}>{error}</p>}
          <CTAButton onClick={() => {
            if (!firstName || !lastName || !phone) { setError(t.infoRequired); return }
            setError(''); setStep('address')
          }}>
            {t.continue}
          </CTAButton>
        </div>
      )}

      {/* ── Delivery address step ─────────────────────── */}
      {step === 'address' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => setStep('info')} className="flex items-center gap-1 font-semibold -mt-1 mb-1" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            ← {lang === 'es' ? 'Atrás' : 'Back'}
          </button>
          <SectionLabel>{lang === 'es' ? 'Información de entrega' : 'Delivery information'}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StyledInput
              label={lang === 'es' ? 'Dirección' : 'Street address'}
              value={street}
              onChange={e => setStreet(e.target.value)}
              required
              placeholder={lang === 'es' ? 'Ej: 123 Main St' : 'e.g. 123 Main St'}
            />
            <StyledInput
              label={lang === 'es' ? 'Apt / Unidad (opcional)' : 'Apt / Unit (optional)'}
              value={apt}
              onChange={e => setApt(e.target.value)}
              placeholder={lang === 'es' ? 'Apt, suite, unidad...' : 'Apt, suite, unit...'}
            />
            <StyledInput
              label={lang === 'es' ? 'Ciudad' : 'City'}
              value={city}
              onChange={e => setCity(e.target.value)}
              required
              placeholder={lang === 'es' ? 'Ciudad' : 'City'}
            />
            <div>
              <FieldLabel>{lang === 'es' ? 'Instrucciones (opcional)' : 'Instructions (optional)'}</FieldLabel>
              <textarea
                value={deliveryInstructions}
                onChange={e => setDeliveryInstructions(e.target.value)}
                rows={2}
                placeholder={lang === 'es' ? 'Ej: Tocar el timbre, dejar en portería...' : 'e.g. Ring doorbell, leave at front desk...'}
                className="w-full font-body"
                style={{
                  padding: '12px 16px',
                  borderRadius: 16,
                  border: '1.5px solid var(--border)',
                  background: 'var(--card)',
                  fontSize: 15,
                  color: 'var(--chocolate)',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>
          </div>
          {addressError && (
            <p className="text-sm font-medium p-3 rounded-xl" style={{ background: '#FEE2E2', color: '#991B1B' }}>
              {addressError}
            </p>
          )}
          {error && <p className="text-sm text-center font-medium" style={{ color: '#DC2626' }}>{error}</p>}
          <CTAButton loading={loading} onClick={handleAddressNext}>
            {t.continue}
          </CTAButton>
        </div>
      )}

      {/* ── Schedule step ─────────────────────────────── */}
      {step === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => setStep('address')} className="flex items-center gap-1 font-semibold -mt-1 mb-1" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            ← {lang === 'es' ? 'Atrás' : 'Back'}
          </button>
          <SectionLabel>{lang === 'es' ? 'Día de entrega' : 'Delivery day'}</SectionLabel>
          {deliveryDates.length === 0 && !loading && (
            <div className="py-6 rounded-2xl text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.noDatesSub}</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deliveryDates.map(date => {
              const d = new Date(date.date + 'T12:00:00')
              const weekday = d.toLocaleDateString(dateLocale, { weekday: 'long' })
              const monthDay = d.toLocaleDateString(dateLocale, { month: 'long', day: 'numeric' })
              const dayNum = d.getDate()
              const isSelected = selectedDateId === date.id
              return (
                <button
                  key={date.id}
                  onClick={() => loadSlots(date.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 16px',
                    borderRadius: 18,
                    background: isSelected ? 'var(--rose-light)' : 'var(--card)',
                    border: `${isSelected ? 2 : 1}px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}>
                  {/* Day number badge */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: isSelected ? 'var(--rose)' : 'var(--cream-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="font-display font-bold" style={{ fontSize: 20, color: isSelected ? 'white' : 'var(--chocolate)' }}>{dayNum}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="font-display font-bold" style={{ fontSize: 16, color: isSelected ? 'var(--rose-dark)' : 'var(--chocolate)', textTransform: 'capitalize', lineHeight: 1.2 }}>{weekday}</p>
                    <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: 2 }}>{monthDay}</p>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? 'var(--rose)' : 'transparent',
                    border: `2px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {selectedDateId && (
            <div>
              <SectionLabel>{t.chooseTime}</SectionLabel>
              {loading ? (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.loadingTimes}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {availableSlots.map(({ slot, available }) => {
                    const isSelected = selectedSlotId === slot.id
                    return (
                      <button
                        key={slot.id}
                        onClick={() => available && setSelectedSlotId(slot.id)}
                        disabled={!available}
                        className="font-display font-semibold"
                        style={{
                          height: 48,
                          borderRadius: 14,
                          background: isSelected ? 'var(--rose-light)' : available ? 'var(--card)' : 'var(--cream-dark)',
                          color: isSelected ? 'var(--rose-dark)' : 'var(--chocolate)',
                          border: `${isSelected ? 2 : 1}px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                          opacity: available ? 1 : 0.4,
                          cursor: available ? 'pointer' : 'not-allowed',
                          fontSize: 13,
                        }}>
                        {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <CTAButton disabled={!selectedSlotId} onClick={() => setStep('payment')}>
            {t.continue}
          </CTAButton>
        </div>
      )}

      {/* ── Payment step ──────────────────────────────── */}
      {step === 'payment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => setStep('schedule')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: -4 }}>
            ← {lang === 'es' ? 'Atrás' : 'Back'}
          </button>
          <SectionLabel>{t.paymentMethod}</SectionLabel>

          {/* Info pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream-dark)', borderRadius: 14, padding: '10px 14px', marginTop: -8 }}>
            <span style={{ fontSize: 16 }}>🛵</span>
            <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {lang === 'es' ? 'Paga al recibir — no necesitas pagar hoy.' : 'Pay at delivery — no payment needed today.'}
            </p>
          </div>

          {/* Payment options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['zelle', 'cash'] as const).map(method => {
              const isSelected = paymentMethod === method
              return (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    borderRadius: 18,
                    background: isSelected ? 'var(--rose-light)' : 'var(--card)',
                    border: `${isSelected ? 2 : 1}px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                    textAlign: 'left', cursor: 'pointer',
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: isSelected ? 'var(--rose)' : 'var(--cream-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>
                    {method === 'zelle' ? '💸' : '💵'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="font-display font-bold" style={{ fontSize: 16, color: isSelected ? 'var(--rose-dark)' : 'var(--chocolate)', lineHeight: 1.2 }}>
                      {method === 'zelle' ? t.zelleOption : (lang === 'es' ? 'Efectivo' : 'Cash')}
                    </p>
                    <p className="font-body" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {method === 'zelle' ? t.zelleOptionSub : (lang === 'es' ? 'Paga en efectivo al recibir' : 'Pay cash at delivery')}
                    </p>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? 'var(--rose)' : 'transparent',
                    border: `2px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Order summary card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
              <p className="font-display font-bold" style={{ fontSize: 14, color: 'var(--chocolate)', letterSpacing: '0.02em' }}>{t.orderSummary}</p>
            </div>
            <div style={{ padding: '10px 16px 0' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.product.name} × {item.quantity}</span>
                  <span className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>${item.itemTotal.toFixed(2)}</span>
                </div>
              ))}
              {deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{t.deliveryFee}</span>
                  <span className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--rose-light)', borderTop: '1px solid var(--border)' }}>
              <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)' }}>{t.total}</span>
              <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--rose-dark)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {error && <p style={{ fontSize: 13, fontWeight: 600, padding: '10px 14px', borderRadius: 12, background: '#FEE2E2', color: '#991B1B' }}>{error}</p>}

          <CTAButton loading={loading} disabled={!paymentMethod} onClick={handlePlaceOrder}>
            {t.placeOrder(total.toFixed(2))}
          </CTAButton>
        </div>
      )}
    </div>
  )
}
