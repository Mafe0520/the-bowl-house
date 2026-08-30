import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ children, padding = true, className = '', style, ...props }: CardProps) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 20,
        padding: padding ? '16px' : 0,
        background: 'var(--card)',
        border: '1.5px solid var(--border)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
