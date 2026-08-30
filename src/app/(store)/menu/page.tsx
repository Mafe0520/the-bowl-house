import { products } from '@/lib/data/mock-store'
import { MenuClient } from '@/components/store/MenuClient'
import { Product } from '@/types'

export default async function MenuPage() {
  const activeProducts: Product[] = products.filter(p => p.is_active)
  return <MenuClient products={activeProducts} />
}
