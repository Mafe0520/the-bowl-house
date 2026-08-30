'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product, productName, productDescription } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { ChevronRight } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage()
  const name = productName(product, lang)
  const desc = productDescription(product, lang)
  const isCustomizable = product.is_customizable

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block"
      style={{ marginLeft: 16, marginRight: 16, marginBottom: 10 }}
    >
      <div
        className="flex items-center gap-3 overflow-hidden transition-all duration-150 active:scale-98"
        style={{
          background: 'var(--card)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          boxShadow: '0 1px 4px rgba(60,26,12,0.05)',
          padding: '12px 14px 12px 12px',
        }}
      >
        {/* Image */}
        <div
          className="relative flex-shrink-0 rounded-2xl overflow-hidden"
          style={{ width: 88, height: 88, background: 'var(--cream-dark)' }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={name}
              fill
              className="object-contain"
              style={{ padding: '8px' }}
              sizes="88px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold"
              style={{ color: 'var(--rose)', fontSize: 26 }}>
              {name.charAt(0)}
            </div>
          )}
          {product.is_sold_out && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(60,26,12,0.5)' }}>
              <span className="font-display font-bold text-white" style={{ fontSize: 11 }}>{t.soldOut}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {isCustomizable && (
                <span
                  className="inline-block font-body font-bold mb-1"
                  style={{
                    fontSize: 10,
                    color: 'var(--rose-dark)',
                    background: 'var(--rose-light)',
                    borderRadius: 6,
                    padding: '1px 6px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {lang === 'es' ? 'Personalizable' : 'Customizable'}
                </span>
              )}
              <p className="font-display font-bold leading-tight" style={{ fontSize: 16, color: 'var(--chocolate)' }}>
                {name}
              </p>
            </div>
            <span className="font-display font-bold flex-shrink-0" style={{ fontSize: 15, color: 'var(--rose)' }}>
              ${product.price.toFixed(2)}
            </span>
          </div>
          {desc && (
            <p
              className="font-body mt-1"
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties}
            >
              {desc}
            </p>
          )}
          {!product.is_sold_out && (
            <div className="flex items-center justify-end mt-2">
              <div
                className="flex items-center gap-1 font-display font-bold text-white"
                style={{
                  height: 32,
                  paddingLeft: 14,
                  paddingRight: 10,
                  borderRadius: 10,
                  fontSize: 13,
                  background: isCustomizable ? 'var(--rose)' : 'var(--caramel)',
                }}
              >
                {isCustomizable ? (lang === 'es' ? 'Personalizar' : 'Customize') : (lang === 'es' ? 'Agregar' : 'Add')}
                <ChevronRight size={14} strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
