import { settings } from '@/lib/data/mock-store'
import { HomeFeatured } from '@/components/store/HomeFeatured'

export default async function HomePage() {
  const accepting = settings.accepting_orders === 'true'
  return <HomeFeatured accepting={accepting} />
}
