import type { Lang } from '@/lib/i18n/translations'
export type { Lang }

export interface SelectionOption {
  id: string
  name: string
  name_en?: string
  name_es?: string
  price: number       // 0 = included, >0 = extra charge
  is_extra?: boolean  // true = only available as paid extra
}

export interface SelectionGroup {
  id: string
  label: string
  label_en?: string
  label_es?: string
  required: number        // exactly N must be chosen (0 = optional)
  max_extras: number      // how many extras of this type allowed
  options: SelectionOption[]        // included/required options (price: 0)
  extra_options: SelectionOption[]  // paid extras
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  is_sold_out: boolean
  is_featured: boolean
  free_toppings_limit: number
  display_order: number
  created_at: string
  updated_at: string
  // Bilingual
  name_en: string | null
  name_es: string | null
  description_en: string | null
  description_es: string | null
  toppings?: Topping[]
  // New customization model
  is_customizable: boolean
  selection_groups?: SelectionGroup[]
}

export interface Topping {
  id: string
  name: string
  price: number
  image_url: string | null
  is_available: boolean
  display_order: number
  // Bilingual
  name_en: string | null
  name_es: string | null
}

export interface DeliveryZone {
  id: string
  name: string
  is_active: boolean
  cities?: DeliveryZoneCity[]
  zip_codes?: DeliveryZoneZipCode[]
}

export interface DeliveryZoneCity {
  id: string
  zone_id: string
  city: string
  state: string
}

export interface DeliveryZoneZipCode {
  id: string
  zone_id: string
  zip_code: string
}

export interface DeliveryDate {
  id: string
  date: string
  day_of_week: 'wednesday' | 'sunday'
  is_active: boolean
  accepting_orders: boolean
  cutoff_datetime: string | null
  slots?: DeliverySlot[]
  pickup_slots?: PickupSlot[]
}

export interface DeliverySlot {
  id: string
  delivery_date_id: string
  start_time: string
  end_time: string
  is_active: boolean
  is_manually_closed: boolean
  display_order: number
}

export interface PickupSlot {
  id: string
  delivery_date_id: string
  start_time: string
  end_time: string
  capacity: number
  is_active: boolean
  display_order: number
}

export interface Customer {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
}

export type OrderStatus =
  | 'new' | 'confirmed' | 'preparing' | 'ready'
  | 'out_for_delivery' | 'delivered' | 'picked_up' | 'cancelled'

export type PaymentStatus = 'payment_due' | 'paid' | 'refunded'
export type PaymentMethod = 'zelle' | 'cash'
export type FulfillmentType = 'delivery' | 'pickup'

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  customer_first_name: string
  customer_last_name: string
  customer_phone: string
  customer_email: string | null
  fulfillment_type: FulfillmentType
  delivery_date_id: string | null
  delivery_slot_id: string | null
  pickup_slot_id: string | null
  street_address: string | null
  apartment: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  delivery_instructions: string | null
  delivery_zone_id: string | null
  zone_name: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_confirmed_at: string | null
  payment_confirmed_by: string | null
  payment_request_sent_at: string | null
  payment_request_count: number
  last_payment_request_sent_at: string | null
  order_status: OrderStatus
  delivered_at: string | null
  picked_up_at: string | null
  admin_notes: string | null
  preferred_language: Lang
  created_at: string
  updated_at: string
  items?: OrderItem[]
  delivery_date?: DeliveryDate
  delivery_slot?: DeliverySlot
  pickup_slot?: PickupSlot
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  item_total: number
  toppings?: OrderItemTopping[]
  selections?: CartItemSelection[]
}

export interface OrderItemTopping {
  id: string
  order_item_id: string
  topping_id: string | null
  topping_name: string
  topping_price: number
  is_free: boolean
}

// Cart types (client-side only)
export interface CartTopping {
  id: string
  name: string
  price: number
  is_free: boolean
}

export interface CartItemSelection {
  group_id: string
  option_id: string
  option_name: string
  price: number  // 0 if included, >0 if extra
}

export interface CartItem {
  id: string
  product: Product
  toppings: CartTopping[]
  quantity: number
  itemTotal: number
  selections?: CartItemSelection[]
}

export interface BusinessSettings {
  accepting_orders: string
  delivery_enabled: string
  delivery_fee: string
  pickup_enabled: string
  zelle_recipient_name: string
  zelle_phone_email: string
  zelle_payment_url: string
  slot_reservation_minutes: string
  pickup_capacity: string
  same_zone_capacity: string
  two_zone_capacity: string
  three_plus_zone_capacity: string
}

export interface SlotAvailability {
  slot: DeliverySlot
  available: boolean
  reason?: string
  currentCount: number
  capacity: number
  zonesPresent: number
}

// Helper: resolve bilingual field
export function productName(p: Product, lang: Lang): string {
  if (lang === 'es') return p.name_es || p.name_en || p.name
  return p.name_en || p.name
}

export function productDescription(p: Product, lang: Lang): string | null {
  if (lang === 'es') return p.description_es || p.description_en || p.description
  return p.description_en || p.description
}

export function toppingName(t: Topping, lang: Lang): string {
  if (lang === 'es') return t.name_es || t.name_en || t.name
  return t.name_en || t.name
}

export function selectionGroupLabel(g: SelectionGroup, lang: Lang): string {
  if (lang === 'es') return g.label_es || g.label_en || g.label
  return g.label_en || g.label
}
