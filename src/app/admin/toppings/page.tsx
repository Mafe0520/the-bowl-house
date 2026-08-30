'use client'

export const dynamic = 'force-dynamic'

import { Card } from '@/components/ui/Card'

export default function AdminToppingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold mb-6" style={{ color: 'var(--chocolate)' }}>Toppings</h1>
      <Card>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Los toppings, frutas y salsas están configurados directamente en cada producto personalizable.
          Para modificarlos, edita el código fuente del producto correspondiente en{' '}
          <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--cream-dark)', color: 'var(--chocolate)' }}>
            src/lib/data/mock-store.ts
          </code>.
        </p>
      </Card>
    </div>
  )
}
