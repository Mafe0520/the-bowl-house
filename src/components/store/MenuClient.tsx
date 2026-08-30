'use client'

import { Product } from '@/types'
import { ProductCard } from '@/components/store/ProductCard'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Props { products: Product[] }

export function MenuClient({ products }: Props) {
  const { lang } = useLanguage()
  return (
    <div className="pb-4">
      <div className="px-5 pt-5 pb-3">
        <h1
          className="font-display font-bold"
          style={{ fontSize: 28, color: 'var(--chocolate)' }}
        >
          {lang === 'es' ? 'Menú' : 'Menu'}
        </h1>
        <p className="font-body mt-1" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {lang === 'es' ? 'Elige tu favorito para la próxima entrega.' : 'Choose your favorite for the next delivery.'}
        </p>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-20 px-4">
          <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80, margin: '0 auto 16px', opacity: 0.3 }}>
            <path d="M20,50 Q20,85 60,85 Q100,85 100,50 Z" fill="var(--caramel)" />
            <line x1="15" y1="50" x2="105" y2="50" stroke="var(--caramel)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="42" r="14" fill="var(--caramel)" />
            <circle cx="68" cy="38" r="16" fill="var(--caramel)" />
          </svg>
          <p className="font-display text-xl" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'es' ? 'Menú próximamente' : 'Menu coming soon!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col pb-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
