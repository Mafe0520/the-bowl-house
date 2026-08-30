import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/data/mock-store'
import { ProductCustomizer } from '@/components/store/ProductCustomizer'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  return <ProductCustomizer product={product} />
}
