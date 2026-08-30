'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Product, SelectionGroup, SelectionOption, CartItemSelection,
  productName, productDescription, selectionGroupLabel,
} from '@/types'
import { useCart } from '@/lib/cart-store'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ChevronLeft, Minus, Plus, Check } from 'lucide-react'

interface Props { product: Product }

const EMOJI_MAP: Record<string, string> = {
  // frutas
  durazno: '🍑', fresa: '🍓', mango: '🥭', kiwi: '🥝', cereza: '🍒', guanabana: '🍏', banano: '🍌',
  // salsas
  mora: '🫐', arequipe: '🍮', lecherita: '🥛', maracuya: '🌼', nutella: '🍫',
  // toppings
  'queso-rallado': '🧀', 'chocolate-blanco': '🍫', 'chocolate-negro': '🍫',
  oreo: '🍪', 'mini-chips': '🍬', quipitos: '🌾',
}

function getEmoji(id: string) {
  return EMOJI_MAP[id] || '🫙'
}

function BowlPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
      <svg viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg" style={{ width: 130, height: 110, opacity: 0.3 }}>
        <path d="M22,62 Q22,108 80,108 Q138,108 138,62 Z" fill="var(--caramel)" />
        <line x1="16" y1="62" x2="144" y2="62" stroke="var(--caramel)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="54" cy="52" r="18" fill="var(--caramel)" />
        <circle cx="82" cy="45" r="22" fill="var(--caramel)" />
        <circle cx="112" cy="54" r="16" fill="var(--caramel)" />
      </svg>
    </div>
  )
}

// ─── Non-customizable product (Pavé) ─────────────────────────────────────────
function SimpleProduct({ product }: { product: Product }) {
  const router = useRouter()
  const addItem = useCart(s => s.addItem)
  const { lang, t } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const name = productName(product, lang)
  const desc = productDescription(product, lang)
  const total = (product.price * quantity).toFixed(2)

  function handleAdd() {
    if (product.is_sold_out || added) return
    addItem(product, [], quantity, [])
    setAdded(true)
    setTimeout(() => router.push('/cart'), 600)
  }

  return (
    <div style={{ paddingBottom: 'calc(52px + env(safe-area-inset-bottom, 0px) + 100px)' }}>
      {/* Hero image with overlay */}
      <div style={{ position: 'relative', width: '100%', height: 300, background: 'var(--cream-dark)' }}>
        {product.image_url
          ? <Image src={product.image_url} alt={name} fill className="object-cover" sizes="(max-width:600px) 100vw,480px" />
          : <BowlPlaceholder />}
        {/* Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(60,26,12,0.5) 0%, transparent 50%)' }} />
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute', top: 14, left: 14,
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.88)', borderRadius: 20,
            padding: '6px 12px',
            fontSize: 13, fontWeight: 700, color: 'var(--chocolate)',
          }}
        >
          <ChevronLeft size={14} /> {t.back}
        </button>
        {/* Price badge */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'var(--rose)', borderRadius: 20,
          padding: '6px 14px',
        }}>
          <span className="font-display font-bold" style={{ fontSize: 15, color: 'white' }}>${product.price.toFixed(2)}</span>
        </div>
        {/* Name on image */}
        <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
          <h1 className="font-display font-bold" style={{ fontSize: 26, color: 'white', lineHeight: 1.15 }}>{name}</h1>
        </div>
      </div>

      {/* Info card */}
      <div style={{ margin: '16px 16px 0', background: 'var(--card)', borderRadius: 20, border: '1px solid var(--border)', padding: '18px 18px' }}>
        {desc && <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>}
        {product.is_sold_out && (
          <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 14, background: 'var(--cream-dark)', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 14 }}>
            {t.soldOut}
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0,
          bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          padding: '12px 20px 10px',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--cream-dark)', color: 'var(--chocolate)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Minus size={18} />
          </button>
          <span className="font-display font-bold" style={{ fontSize: 22, color: 'var(--chocolate)', minWidth: 28, textAlign: 'center' }}>{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--rose)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={18} />
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={product.is_sold_out}
          style={{
            width: '100%',
            height: 52,
            fontSize: 17,
            fontWeight: 700,
            fontFamily: 'inherit',
            background: product.is_sold_out ? 'var(--cream-dark)' : added ? '#4CAF50' : 'var(--chocolate)',
            color: product.is_sold_out ? 'var(--text-secondary)' : 'white',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {added ? '✓ Agregado' : product.is_sold_out ? t.soldOut : t.addToCart(total)}
        </button>
      </div>
    </div>
  )
}

// ─── Step stepper (numbered circles) ─────────────────────────────────────────
function StepStepper({
  groups, step, requiredSelections, onStepClick,
}: {
  groups: SelectionGroup[]
  step: number
  requiredSelections: Map<string, SelectionOption[]>
  onStepClick: (i: number) => void
}) {
  // steps = groups + extras
  const total = groups.length + 1

  return (
    <div className="px-5 py-4 flex items-center">
      {Array.from({ length: total }).map((_, i) => {
        const isExtras = i === groups.length
        const isDone = isExtras
          ? false
          : (requiredSelections.get(groups[i].id) || []).length >= groups[i].required
        const isActive = step === i
        const label = isExtras ? 'Extras' : selectionGroupLabel(groups[i], 'es')

        let circleBg = 'var(--cream-dark)'
        let circleColor = 'var(--text-secondary)'
        let labelColor = 'var(--text-secondary)'

        if (isDone) {
          circleBg = 'var(--chocolate)'
          circleColor = 'white'
          labelColor = 'var(--chocolate)'
        } else if (isActive) {
          circleBg = 'var(--rose)'
          circleColor = 'white'
          labelColor = 'var(--rose)'
        }

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick(i)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              style={{ minWidth: 40 }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 24, height: 24, background: circleBg, color: circleColor, fontSize: 12, fontWeight: 700 }}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <span style={{ fontSize: 10, color: labelColor, fontWeight: 600, textAlign: 'center', lineHeight: 1.1, maxWidth: 44, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
            </button>
            {/* Connecting line */}
            {i < total - 1 && (
              <div
                className="flex-1 mx-1"
                style={{
                  height: 2,
                  background: isDone ? 'var(--rose)' : 'var(--border)',
                  marginBottom: 14,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Customizable product (Oblea Bowl) ────────────────────────────────────────
function CustomizableFlow({ product }: { product: Product }) {
  const router = useRouter()
  const addItem = useCart(s => s.addItem)
  const { lang, t } = useLanguage()

  const groups = product.selection_groups || []
  const [step, setStep] = useState(0)
  const [requiredSelections, setRequiredSelections] = useState<Map<string, SelectionOption[]>>(new Map())
  const [extraSelections, setExtraSelections] = useState<CartItemSelection[]>([])
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const name = productName(product, lang)

  const currentGroup: SelectionGroup | null = step < groups.length ? groups[step] : null
  const currentSelected = currentGroup ? (requiredSelections.get(currentGroup.id) || []) : []
  const currentGroupDone = currentGroup ? currentSelected.length >= currentGroup.required : true
  const allRequiredDone = groups.every(g => (requiredSelections.get(g.id) || []).length >= g.required)
  const isExtrasStep = step >= groups.length

  const extraCost = extraSelections.reduce((s, e) => s + e.price, 0)
  const unitPrice = product.price + extraCost
  const total = (unitPrice * quantity).toFixed(2)

  function toggleRequired(group: SelectionGroup, option: SelectionOption) {
    setRequiredSelections(prev => {
      const next = new Map(prev)
      const cur = next.get(group.id) || []
      const idx = cur.findIndex(o => o.id === option.id)
      if (idx >= 0) {
        next.set(group.id, cur.filter((_, i) => i !== idx))
      } else if (cur.length < group.required) {
        const updated = [...cur, option]
        next.set(group.id, updated)
      }
      return next
    })
  }

  function toggleExtra(groupId: string, option: SelectionOption) {
    setExtraSelections(prev => {
      const exists = prev.find(e => e.group_id === groupId && e.option_id === option.id)
      if (exists) return prev.filter(e => !(e.group_id === groupId && e.option_id === option.id))
      const group = groups.find(g => g.id === groupId)
      const count = prev.filter(e => e.group_id === groupId).length
      if (group && count >= group.max_extras) return prev
      return [...prev, { group_id: groupId, option_id: option.id, option_name: option.name, price: option.price }]
    })
  }

  function buildSelections(): CartItemSelection[] {
    const sel: CartItemSelection[] = []
    for (const group of groups) {
      for (const opt of (requiredSelections.get(group.id) || [])) {
        sel.push({ group_id: group.id, option_id: opt.id, option_name: opt.name, price: 0 })
      }
    }
    return [...sel, ...extraSelections]
  }

  function handleAddToCart() {
    if (!allRequiredDone || added) return
    addItem(product, [], quantity, buildSelections())
    setAdded(true)
    setTimeout(() => router.push('/cart'), 600)
  }

  return (
    <div style={{ paddingBottom: 'calc(52px + env(safe-area-inset-bottom, 0px) + 64px)' }}>

      {/* Back */}
      <div className="px-5 pt-3 pb-1">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft size={16} /> {t.back}
        </button>
      </div>

      {/* Product header */}
      <div className="px-5 pt-2 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-display font-bold" style={{ fontSize: 22, color: 'var(--chocolate)' }}>{name}</h1>
          <span className="font-display font-bold flex-shrink-0" style={{ fontSize: 22, color: 'var(--rose)' }}>
            ${product.price.toFixed(2)}+
          </span>
        </div>
      </div>

      {/* Step progress */}
      <StepStepper
        groups={groups}
        step={step}
        requiredSelections={requiredSelections}
        onStepClick={setStep}
      />

      {/* ── Required step ─────────────────────────────── */}
      {currentGroup && !isExtrasStep && (
        <div className="px-5">
          {/* Step header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display font-bold" style={{ fontSize: 18, color: 'var(--chocolate)' }}>
              {lang === 'es' ? 'Elige' : 'Choose'} {currentGroup.required} {selectionGroupLabel(currentGroup, lang)}
            </h2>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: currentGroup.required }).map((_, i) => (
                <div key={i} className="rounded-full transition-all"
                  style={{
                    width: 10, height: 10,
                    background: i < currentSelected.length ? 'var(--rose)' : 'var(--cream-dark)',
                    border: `1.5px solid ${i < currentSelected.length ? 'var(--rose)' : 'var(--border)'}`,
                  }} />
              ))}
              <span className="font-bold ml-1" style={{ fontSize: 12, color: 'var(--rose)' }}>
                {currentSelected.length}/{currentGroup.required}
              </span>
            </div>
          </div>

          {/* 2-column chip grid */}
          <div className="grid grid-cols-2 gap-2" style={{ paddingBottom: 8 }}>
            {currentGroup.options.map(option => {
              const isSelected = currentSelected.some(o => o.id === option.id)
              const atMax = !isSelected && currentSelected.length >= currentGroup.required
              return (
                <button
                  key={option.id}
                  onClick={() => !atMax && toggleRequired(currentGroup, option)}
                  style={{
                    height: 44,
                    borderRadius: 14,
                    background: isSelected ? 'rgba(232,146,154,0.12)' : 'var(--card)',
                    border: `${isSelected ? 2 : 1}px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: 12,
                    paddingRight: 10,
                    opacity: atMax ? 0.45 : 1,
                  }}
                >
                  <span style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 700, color: isSelected ? 'var(--rose-dark)' : 'var(--chocolate)' }}>
                    {option.name}
                  </span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: isSelected ? 'var(--rose)' : 'transparent',
                    border: `2px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                  </div>
                </button>
              )
            })}
          </div>

          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="mt-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              ← {lang === 'es' ? 'Atrás' : 'Back'}
            </button>
          )}
        </div>
      )}

      {/* ── Extras step ───────────────────────────────── */}
      {isExtrasStep && (
        <div className="px-5">
          {/* Header */}
          <div className="mb-2">
            <h2 className="font-display font-bold" style={{ fontSize: 18, color: 'var(--chocolate)', marginBottom: 2 }}>
              {lang === 'es' ? 'Extras opcionales' : 'Optional extras'}
            </h2>
            <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {lang === 'es' ? 'Agrega más ingredientes por un costo adicional.' : 'Add more for an extra charge.'}
            </p>
          </div>

          {groups.map(group => (
            <div key={group.id} className="mb-3">
              {/* Category label pill */}
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="font-display font-bold rounded-full px-3"
                  style={{ fontSize: 12, background: 'var(--caramel)', color: 'white', lineHeight: '22px', display: 'inline-block' }}
                >
                  {selectionGroupLabel(group, lang)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {lang === 'es' ? `máx. ${group.max_extras}` : `max. ${group.max_extras}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2" style={{ paddingBottom: 4 }}>
                {group.extra_options.map(opt => {
                  const isSelected = extraSelections.some(e => e.group_id === group.id && e.option_id === opt.id)
                  const atMax = !isSelected && extraSelections.filter(e => e.group_id === group.id).length >= group.max_extras
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !atMax && toggleExtra(group.id, opt)}
                      style={{
                        height: 44,
                        borderRadius: 14,
                        background: isSelected ? 'rgba(232,146,154,0.12)' : 'var(--card)',
                        border: `${isSelected ? 2 : 1}px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingLeft: 10,
                        paddingRight: 8,
                        opacity: atMax ? 0.45 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700, color: isSelected ? 'var(--rose-dark)' : 'var(--chocolate)' }}>
                          {opt.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--caramel)', fontWeight: 700 }}>
                          +${opt.price.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        background: isSelected ? 'var(--rose)' : 'transparent',
                        border: `2px solid ${isSelected ? 'var(--rose)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <button onClick={() => setStep(groups.length - 1)} className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            ← {lang === 'es' ? 'Atrás' : 'Back'}
          </button>
        </div>
      )}

      {/* ── Sticky bottom CTA ─────────────────────────── */}
      <div
        className="fixed left-0 right-0"
        style={{
          bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          padding: '8px 20px',
        }}>
        {(isExtrasStep || allRequiredDone) && (
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="flex items-center justify-center rounded-full"
              style={{ width: 40, height: 40, background: 'var(--cream-dark)', color: 'var(--chocolate)' }}>
              <Minus size={18} />
            </button>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--chocolate)', minWidth: 24, textAlign: 'center' }}>{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="flex items-center justify-center rounded-full"
              style={{ width: 40, height: 40, background: 'var(--rose-light)', color: 'var(--rose-dark)' }}>
              <Plus size={18} />
            </button>
          </div>
        )}

        {isExtrasStep || allRequiredDone ? (
          <button
            onClick={handleAddToCart}
            className="w-full font-display font-bold text-white rounded-2xl flex items-center justify-center transition-transform active:scale-98"
            style={{ height: 52, fontSize: 18, background: added ? '#4CAF50' : 'var(--rose)' }}>
            {added ? '✓ Agregado al carrito' : t.addToCart(total)}
          </button>
        ) : currentGroupDone ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="mx-5 font-display font-bold rounded-2xl flex items-center justify-center transition-transform active:scale-98"
            style={{
              height: 52, fontSize: 18, width: 'calc(100% - 40px)',
              background: 'var(--rose-light)', color: 'var(--rose-dark)',
              border: '2px solid var(--rose)',
            }}>
            {lang === 'es' ? 'Siguiente →' : 'Next →'}
          </button>
        ) : (
          <div
            className="mx-5 font-display font-bold rounded-2xl flex items-center justify-center"
            style={{
              height: 52, fontSize: 17, width: 'calc(100% - 40px)',
              background: 'var(--cream-dark)', color: 'var(--text-secondary)',
            }}>
            {lang === 'es' ? 'Siguiente →' : 'Next →'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ProductCustomizer({ product }: Props) {
  if (!product.is_customizable) return <SimpleProduct product={product} />
  return <CustomizableFlow product={product} />
}
