'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Props {
  accepting: boolean
}

export function HomeFeatured({ accepting }: Props) {
  const { lang } = useLanguage()
  const today = new Date().getDay() // 0=Sun, 3=Wed
  const isDeliveryDay = today === 0 || today === 3

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100dvh - 54px - 52px)',
        padding: '0 20px',
      }}
    >
      {/* Hero image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: 24,
          overflow: 'hidden',
          marginTop: 16,
          aspectRatio: '4/3',
          background: 'var(--cream-dark)',
        }}
      >
        <Image
          src="/oblea.png"
          alt="Oblea Bowl"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 600px) 100vw, 480px"
        />
        {/* Gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(60,26,12,0.55) 0%, transparent 55%)',
          }}
        />
        {/* Overlay tag */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(255,255,255,0.88)',
            borderRadius: 20,
            padding: '4px 12px',
          }}
        >
          <span className="font-body font-bold" style={{ fontSize: 12, color: 'var(--rose-dark)' }}>
            {lang === 'es' ? '🗓 Miérc. & Dom.' : '🗓 Wed. & Sun.'}
          </span>
        </div>
        {/* Bottom overlay text */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <p className="font-display font-bold" style={{ fontSize: 20, color: 'white', lineHeight: 1.2 }}>
            {lang === 'es' ? 'Oblea Bowl' : 'Oblea Bowl'}
          </p>
          <p className="font-body" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            {lang === 'es' ? 'Personaliza cada ingrediente' : 'Customize every ingredient'}
          </p>
        </div>
      </div>

      {/* Brand block */}
      <div style={{ marginTop: 24, marginBottom: 8 }}>
        <h1 className="font-display font-bold" style={{ fontSize: 28, color: 'var(--chocolate)', lineHeight: 1.15 }}>
          {lang === 'es'
            ? <>Postres hechos<br />para antojar.</>
            : <>Desserts made<br />to crave.</>}
        </h1>
        <p className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
          {lang === 'es'
            ? 'Bowls de oblea y pávés cremosos, entregados en tu puerta.'
            : 'Oblea bowls and creamy pavés, delivered to your door.'}
        </p>
      </div>

      {/* Status + CTA */}
      <div style={{ marginTop: 'auto', paddingBottom: 20 }}>
        {accepting ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: isDeliveryDay ? '#e8f5e9' : 'var(--cream-dark)',
                borderRadius: 20,
                padding: '8px 14px',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: isDeliveryDay ? '#4CAF50' : 'var(--caramel)', flexShrink: 0 }} />
                <span className="font-body font-bold" style={{ fontSize: 12, color: isDeliveryDay ? '#2e7d32' : 'var(--text-secondary)' }}>
                  {isDeliveryDay
                    ? (lang === 'es' ? 'Entregamos hoy' : 'Delivering today')
                    : (lang === 'es' ? 'Próxima entrega: miércoles o domingo' : 'Next delivery: Wednesday or Sunday')}
                </span>
              </div>
            </div>
            <Link href="/menu">
              <div
                className="font-display font-bold text-white flex items-center justify-center rounded-2xl transition-transform active:scale-98"
                style={{ height: 54, fontSize: 18, background: 'var(--chocolate)', borderRadius: 18 }}
              >
                {lang === 'es' ? 'Ordenar ahora' : 'Order Now'}
              </div>
            </Link>
          </>
        ) : (
          <>
            <div
              style={{
                background: 'var(--cream-dark)',
                borderRadius: 14,
                padding: '12px 16px',
                marginBottom: 14,
                textAlign: 'center',
              }}
            >
              <p className="font-display font-bold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>
                {lang === 'es' ? '⏳ Pedidos cerrados por ahora' : '⏳ Orders closed for now'}
              </p>
              <p className="font-body" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                {lang === 'es' ? 'Volvemos el miércoles o domingo.' : 'We\'re back Wednesday or Sunday.'}
              </p>
            </div>
            <Link href="/menu">
              <div
                className="font-display font-bold flex items-center justify-center rounded-2xl"
                style={{ height: 54, fontSize: 17, background: 'var(--cream-dark)', color: 'var(--chocolate)', borderRadius: 18 }}
              >
                {lang === 'es' ? 'Ver el menú' : 'See the menu'}
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
