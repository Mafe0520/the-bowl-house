import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { StoreNav } from '@/components/store/StoreNav'
import { BottomNav } from '@/components/store/BottomNav'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
        <StoreNav />
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(52px + env(safe-area-inset-bottom, 0px) + 64px)' }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </LanguageProvider>
  )
}
