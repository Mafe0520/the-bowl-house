'use client'
import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import type { Prospect } from '@/lib/prospector/types'

interface Props { prospect: Prospect; onClose: () => void }

export default function ApproachModal({ prospect, onClose }: Props) {
  const [loading,  setLoading]  = useState(false)
  const [approach, setApproach] = useState('')
  const [copied,   setCopied]   = useState(false)
  const [error,    setError]    = useState('')

  async function generate() {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/prospector/approach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: prospect.id }),
      })
      const data = await res.json()
      if (data.approach) setApproach(data.approach)
      else setError(data.error || 'Error al generar')
    } catch { setError('Error de conexión') }
    setLoading(false)
  }

  async function copy() {
    await navigator.clipboard.writeText(approach)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: '20px',
  }
  const modal: React.CSSProperties = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: '16px', width: '100%', maxWidth: '520px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
  }

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modal}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Generar acercamiento</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {prospect.business_name || 'Prospecto'} · {prospect.language === 'es' ? 'Español' : 'English'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        {prospect.snippet && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{prospect.snippet}"
          </div>
        )}

        <div style={{ padding: '16px 20px' }}>
          {!approach && !loading && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Claude Sonnet escribe un mensaje natural en el idioma de la publicación.
              </p>
              <button onClick={generate} style={{ background: 'var(--rose)', color: '#fff', fontWeight: 700, fontSize: '14px', padding: '10px 22px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                ✨ Generar acercamiento
              </button>
            </div>
          )}

          {loading && <p style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>Escribiendo…</p>}

          {error && <div style={{ background: 'var(--rose-light)', border: '1px solid var(--rose)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--rose-dark)', marginBottom: '12px' }}>{error}</div>}

          {approach && (
            <div>
              <textarea value={approach} onChange={e => setApproach(e.target.value)} rows={5}
                style={{ width: '100%', padding: '12px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)', background: 'var(--bg)', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={copy} style={{ background: 'var(--rose)', color: '#fff', fontWeight: 700, fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                </button>
                <button onClick={generate} style={{ background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  Regenerar
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Revisa el texto antes de usarlo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
