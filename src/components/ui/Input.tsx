'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', style, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {label && (
          <label className="font-body font-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`font-body ${className}`}
          style={{
            borderRadius: 16,
            padding: '10px 16px',
            fontSize: 15,
            outline: 'none',
            background: 'var(--card)',
            border: `1.5px solid ${error ? '#DC2626' : 'var(--border)'}`,
            color: 'var(--text-primary)',
            fontFamily: 'Nunito, sans-serif',
            width: '100%',
            boxSizing: 'border-box',
            ...style,
          }}
          {...props}
        />
        {error && <p className="font-body" style={{ fontSize: 12, color: '#DC2626' }}>{error}</p>}
        {hint && !error && <p className="font-body" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
