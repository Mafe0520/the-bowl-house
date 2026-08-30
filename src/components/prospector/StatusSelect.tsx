'use client'
import { useState } from 'react'
import type { ProspectStatus, LeadStatus } from '@/lib/prospector/types'

const PROSPECT_OPTIONS: { value: ProspectStatus; label: string }[] = [
  { value: 'new',            label: '🆕 Nuevo' },
  { value: 'reviewed',       label: '👀 Revisado' },
  { value: 'commented',      label: '💬 Comenté' },
  { value: 'contacted',      label: '📩 Contactado' },
  { value: 'replied',        label: '✅ Respondió' },
  { value: 'not_interested', label: '❌ No interesado' },
  { value: 'client',         label: '🎉 Cliente' },
  { value: 'ignore',         label: '🚫 Ignorar' },
]

const LEAD_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new',       label: '🆕 Nuevo' },
  { value: 'reviewed',  label: '👀 Revisado' },
  { value: 'contacted', label: '📩 Contactado' },
  { value: 'client',    label: '🎉 Cliente' },
]

interface Props {
  id:     string
  value:  string
  type:   'prospect' | 'lead'
  onSave?:(v: string) => void
}

export default function StatusSelect({ id, value, type, onSave }: Props) {
  const [current, setCurrent] = useState(value)
  const [saving,  setSaving]  = useState(false)
  const options = type === 'prospect' ? PROSPECT_OPTIONS : LEAD_OPTIONS

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setCurrent(v)
    setSaving(true)
    const endpoint = type === 'prospect'
      ? `/api/prospector/prospects/${id}`
      : `/api/prospector/leads/${id}`
    await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: v }),
    })
    setSaving(false)
    onSave?.(v)
  }

  return (
    <select value={current} onChange={handleChange} disabled={saving}
      style={{
        fontSize: '12px', fontWeight: 600, padding: '4px 8px',
        border: '1px solid var(--border)', borderRadius: '8px',
        background: 'var(--bg)', color: 'var(--text-secondary)',
        cursor: 'pointer', opacity: saving ? 0.6 : 1,
      }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
