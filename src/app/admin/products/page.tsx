'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Product, Topping } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Pencil, X, Check } from 'lucide-react'

const EMPTY: Partial<Product> = {
  name: '', slug: '', description: '', price: 0,
  is_active: true, is_sold_out: false, is_featured: false,
  is_customizable: false,
  free_toppings_limit: 0, display_order: 0, image_url: '',
}

const fieldLabels: Record<string, string> = {
  is_active: 'Activo', is_sold_out: 'Agotado', is_featured: 'Destacado', is_customizable: 'Personalizable',
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [toppings, setToppings] = useState<Topping[]>([])
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [prodsRes, topsRes] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/admin/toppings'),
    ])
    const prods: (Product & { toppings?: Topping[] })[] = await prodsRes.json()
    const tops: Topping[] = await topsRes.json()
    setProducts(prods)
    setToppings(tops)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(product?: Product & { toppings?: Topping[] }) {
    if (product) {
      setEditing({ ...product })
      const associated = (product.toppings || []).map(t => t.id)
      setSelectedToppings(associated)
    } else {
      setEditing({ ...EMPTY })
      setSelectedToppings([])
    }
  }

  async function save() {
    if (!editing?.name || !editing?.slug) return
    setSaving(true)

    const method = editing.id ? 'PATCH' : 'POST'
    await fetch('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editing, topping_ids: selectedToppings }),
    })

    setSaving(false)
    setEditing(null)
    load()
  }

  async function toggleField(product: Product, field: 'is_active' | 'is_sold_out' | 'is_featured') {
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, [field]: !product[field] }),
    })
    load()
  }

  async function deleteProduct(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="font-display font-bold" style={{ fontSize: 28, color: 'var(--chocolate)' }}>Productos</h1>
        <button onClick={() => startEdit()} className="font-body font-bold"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 20, fontSize: 13, background: 'var(--rose)', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Plus size={15} /> Agregar producto
        </button>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16, background: 'rgba(60,26,12,0.4)' }}
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <Card className="animate-pop-in" style={{ width: '100%', maxWidth: 520, maxHeight: '90dvh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 className="font-display font-bold" style={{ fontSize: 20, color: 'var(--chocolate)' }}>
                {editing.id ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Nombre" value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} required />
              <Input label="Nombre EN" value={editing.name_en || ''} onChange={e => setEditing(p => ({ ...p, name_en: e.target.value }))} />
              <Input label="Nombre ES" value={editing.name_es || ''} onChange={e => setEditing(p => ({ ...p, name_es: e.target.value }))} />
              <Input label="Slug (URL)" value={editing.slug || ''} onChange={e => setEditing(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} required />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="font-body font-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Descripción</label>
                <textarea value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} rows={2} style={{ borderRadius: 16, padding: '10px 16px', fontSize: 15, outline: 'none', resize: 'none', background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="font-body font-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Descripción EN</label>
                <textarea value={editing.description_en || ''} onChange={e => setEditing(p => ({ ...p, description_en: e.target.value }))} rows={2} style={{ borderRadius: 16, padding: '10px 16px', fontSize: 15, outline: 'none', resize: 'none', background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="font-body font-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Descripción ES</label>
                <textarea value={editing.description_es || ''} onChange={e => setEditing(p => ({ ...p, description_es: e.target.value }))} rows={2} style={{ borderRadius: 16, padding: '10px 16px', fontSize: 15, outline: 'none', resize: 'none', background: 'var(--bg)', border: '2px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif' }} />
              </div>
              <Input label="Precio" type="number" step="0.01" value={editing.price || ''} onChange={e => setEditing(p => ({ ...p, price: parseFloat(e.target.value) }))} />
              <Input label="URL de imagen" value={editing.image_url || ''} onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))} />
              <Input label="Toppings gratis incluidos" type="number" value={editing.free_toppings_limit || 0} onChange={e => setEditing(p => ({ ...p, free_toppings_limit: parseInt(e.target.value) }))} />
              <Input label="Orden de visualización" type="number" value={editing.display_order || 0} onChange={e => setEditing(p => ({ ...p, display_order: parseInt(e.target.value) }))} />

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {(['is_active', 'is_sold_out', 'is_featured', 'is_customizable'] as const).map(field => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    <input type="checkbox" checked={!!editing[field]} onChange={e => setEditing(p => ({ ...p, [field]: e.target.checked }))} />
                    {fieldLabels[field]}
                  </label>
                ))}
              </div>

              {toppings.length > 0 && (
                <div>
                  <p className="font-body font-semibold" style={{ fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>Toppings permitidos</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {toppings.map(t => {
                      const on = selectedToppings.includes(t.id)
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedToppings(prev => on ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                          className="font-body font-bold"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '5px 12px', borderRadius: 20, fontSize: 12,
                            background: on ? 'var(--rose-light)' : 'var(--bg)',
                            color: on ? 'var(--rose-dark)' : 'var(--text-secondary)',
                            border: `1.5px solid ${on ? 'var(--rose)' : 'var(--border)'}`,
                          }}
                        >
                          {on && <Check size={10} />} {t.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <Button fullWidth loading={saving} onClick={save}>Guardar producto</Button>
            </div>
          </Card>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(product => (
          <Card key={product.id}>
            {/* Top row: name + icons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="font-display font-bold" style={{ fontSize: 17, color: 'var(--chocolate)' }}>{product.name}</span>
              <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                <button onClick={() => startEdit(product as Product & { toppings?: Topping[] })} style={{ color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Pencil size={16} /></button>
                <button onClick={() => deleteProduct(product.id)} style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={16} /></button>
              </div>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              <button onClick={() => toggleField(product, 'is_active')} className="font-body font-bold"
                style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: product.is_active ? '#D1FAE5' : '#FEE2E2',
                  color: product.is_active ? '#065F46' : '#991B1B' }}>
                {product.is_active ? 'Activo' : 'Inactivo'}
              </button>
              <button onClick={() => toggleField(product, 'is_sold_out')} className="font-body font-bold"
                style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: product.is_sold_out ? '#FEE2E2' : 'var(--bg)',
                  color: product.is_sold_out ? '#991B1B' : 'var(--text-secondary)',
                  outline: '1px solid var(--border)' }}>
                {product.is_sold_out ? 'Agotado' : 'En stock'}
              </button>
              {product.is_featured && (
                <span className="font-body font-bold" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--rose-light)', color: 'var(--rose-dark)' }}>Destacado</span>
              )}
              <span className="font-body font-bold" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg)', color: 'var(--text-secondary)', outline: '1px solid var(--border)' }}>
                {product.is_customizable ? 'Personalizable' : 'Fijo'}
              </span>
            </div>

            {product.description && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{product.description}</p>
            )}
            <p className="font-display font-bold" style={{ fontSize: 16, color: 'var(--rose)' }}>${product.price.toFixed(2)}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
