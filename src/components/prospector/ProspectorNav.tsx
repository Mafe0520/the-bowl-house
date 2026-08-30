'use client'
import { useState } from 'react'

export default function ProspectorNav() {
  const [scanning,  setScanning]  = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [msg, setMsg]             = useState('')

  async function run(endpoint: string, setLoading: (v: boolean) => void) {
    setLoading(true); setMsg('')
    try {
      const res  = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      setMsg(data.message || data.error || 'Listo')
    } catch { setMsg('Error de conexión') }
    setLoading(false)
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <button onClick={() => run('/api/prospector/scan', setScanning)} disabled={scanning}
        style={{ fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.6 : 1 }}>
        {scanning ? '⏳ Escaneando…' : '🔍 Escanear web'}
      </button>
      <button onClick={() => run('/api/prospector/scan-instagram', setScanning)} disabled={scanning}
        style={{ fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.6 : 1 }}>
        {scanning ? '⏳ Escaneando…' : '📸 Instagram'}
      </button>
      <button onClick={() => run('/api/prospector/scan-facebook', setScanning)} disabled={scanning}
        style={{ fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.6 : 1 }}>
        {scanning ? '⏳ Escaneando…' : '👥 Facebook'}
      </button>
      <button onClick={() => run('/api/prospector/analyze', setAnalyzing)} disabled={analyzing}
        style={{ fontSize: '13px', fontWeight: 700, padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'var(--rose)', color: '#fff', cursor: analyzing ? 'not-allowed' : 'pointer', opacity: analyzing ? 0.6 : 1 }}>
        {analyzing ? '⏳ Analizando…' : '🧠 Analizar'}
      </button>
      {msg && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{msg}</span>}
    </div>
  )
}
