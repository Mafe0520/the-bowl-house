interface BadgeProps {
  children: React.ReactNode
  variant?: 'rose' | 'caramel' | 'green' | 'red' | 'gray' | 'blush'
}

const styles: Record<string, React.CSSProperties> = {
  rose: { background: 'var(--rose-light)', color: 'var(--rose-dark)' },
  caramel: { background: '#FEF3C7', color: '#92400E' },
  green: { background: '#D1FAE5', color: '#065F46' },
  red: { background: '#FEE2E2', color: '#991B1B' },
  gray: { background: 'var(--cream-dark)', color: 'var(--text-secondary)' },
  blush: { background: 'var(--rose-light)', color: 'var(--rose-dark)' },
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span
      className="font-body font-semibold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        ...styles[variant],
      }}
    >
      {children}
    </span>
  )
}
