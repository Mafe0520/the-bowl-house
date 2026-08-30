'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: 13 },
  md: { padding: '11px 22px', fontSize: 15 },
  lg: { padding: '14px 28px', fontSize: 17 },
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--rose)', color: 'white' },
  secondary: { background: 'var(--card)', color: 'var(--text-primary)', border: '1.5px solid var(--border)' },
  ghost: { background: 'transparent', color: 'var(--rose)' },
  danger: { background: '#DC2626', color: 'white' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, disabled, className = '', style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`font-display font-semibold ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderRadius: 20,
          border: 'none',
          cursor: disabled || loading ? 'default' : 'pointer',
          whiteSpace: 'nowrap',
          width: fullWidth ? '100%' : undefined,
          opacity: disabled || loading ? 0.6 : 1,
          ...sizeStyles[size],
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {loading && (
          <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
