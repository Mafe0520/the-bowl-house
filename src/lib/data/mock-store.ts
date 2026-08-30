/**
 * Mock in-memory data store for The Bowl House.
 * Replace with Supabase service in production.
 *
 * All arrays are mutable so admin CRUD operations work at runtime.
 */

import type {
  Product, Topping, DeliveryZone, DeliveryZoneCity, DeliveryZoneZipCode,
  DeliveryDate, DeliverySlot, Order, OrderItem, OrderItemTopping, CartItemSelection,
  SelectionGroup,
} from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nextWeekday(dayOfWeek: number): string {
  // dayOfWeek: 0=Sun, 3=Wed
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = (dayOfWeek - today.getDay() + 7) % 7 || 7
  const d = new Date(today)
  d.setDate(today.getDate() + diff)
  return d.toISOString().split('T')[0]
}

const SAT_DATE = nextWeekday(6) // next Saturday
const SUN_DATE = nextWeekday(0) // next Sunday

// ---------------------------------------------------------------------------
// Toppings (legacy — now embedded in selection_groups)
// ---------------------------------------------------------------------------

export let toppings: Topping[] = []

// ---------------------------------------------------------------------------
// Selection groups for Oblea Bowl
// ---------------------------------------------------------------------------

const obleaBowlSelectionGroups: SelectionGroup[] = [
  {
    id: 'frutas',
    label: 'Frutas',
    label_en: 'Fruits',
    label_es: 'Frutas',
    required: 3,
    max_extras: 3,
    options: [
      { id: 'durazno', name: 'Durazno', price: 0 },
      { id: 'fresa', name: 'Fresa', price: 0 },
      { id: 'mango', name: 'Mango', price: 0 },
      { id: 'kiwi', name: 'Kiwi', price: 0 },
      { id: 'cereza', name: 'Cereza', price: 0 },
      { id: 'guanabana', name: 'Guanábana', price: 0 },
      { id: 'banano', name: 'Banano', price: 0 },
    ],
    extra_options: [
      { id: 'durazno-extra', name: 'Durazno', price: 1, is_extra: true },
      { id: 'fresa-extra', name: 'Fresa', price: 1, is_extra: true },
      { id: 'mango-extra', name: 'Mango', price: 1, is_extra: true },
      { id: 'kiwi-extra', name: 'Kiwi', price: 1, is_extra: true },
      { id: 'cereza-extra', name: 'Cereza', price: 1, is_extra: true },
      { id: 'banano-extra', name: 'Banano', price: 1, is_extra: true },
      { id: 'guanabana-extra', name: 'Guanábana', price: 2, is_extra: true },
    ],
  },
  {
    id: 'salsas',
    label: 'Salsas',
    label_en: 'Sauces',
    label_es: 'Salsas',
    required: 2,
    max_extras: 2,
    options: [
      { id: 'mora', name: 'Mora', price: 0 },
      { id: 'arequipe', name: 'Arequipe', price: 0 },
      { id: 'lecherita', name: 'Lecherita', price: 0 },
      { id: 'maracuya', name: 'Maracuyá', price: 0 },
      { id: 'nutella', name: 'Nutella', price: 0 },
    ],
    extra_options: [
      { id: 'mora-extra', name: 'Mora', price: 1, is_extra: true },
      { id: 'arequipe-extra', name: 'Arequipe', price: 1, is_extra: true },
      { id: 'lecherita-extra', name: 'Lecherita', price: 1, is_extra: true },
      { id: 'maracuya-extra', name: 'Maracuyá', price: 1, is_extra: true },
      { id: 'nutella-extra', name: 'Nutella', price: 2, is_extra: true },
    ],
  },
  {
    id: 'toppings',
    label: 'Toppings',
    label_en: 'Toppings',
    label_es: 'Toppings',
    required: 1,
    max_extras: 2,
    options: [
      { id: 'queso-rallado', name: 'Queso rallado', price: 0 },
      { id: 'choco-blanco', name: 'Chocolate blanco', price: 0 },
      { id: 'choco-negro', name: 'Chocolate negro', price: 0 },
      { id: 'oreo', name: 'Oreo', price: 0 },
      { id: 'mini-chips', name: 'Mini Chips', price: 0 },
      { id: 'quipitos', name: 'Quipitos', price: 0 },
    ],
    extra_options: [
      { id: 'choco-blanco-extra', name: 'Chocolate blanco', price: 1, is_extra: true },
      { id: 'choco-negro-extra', name: 'Chocolate negro', price: 1, is_extra: true },
      { id: 'oreo-extra', name: 'Oreo', price: 1, is_extra: true },
      { id: 'mini-chips-extra', name: 'Mini Chips', price: 1, is_extra: true },
      { id: 'quipitos-extra', name: 'Quipitos', price: 1, is_extra: true },
      { id: 'queso-rallado-extra', name: 'Queso rallado', price: 2, is_extra: true },
    ],
  },
]

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const now = new Date().toISOString()

export let products: Product[] = [
  {
    id: 'oblea-bowl',
    name: 'Oblea Bowl',
    slug: 'oblea-bowl',
    description: 'Personaliza tu oblea con 3 frutas, 2 salsas y 1 topping incluidos.',
    description_en: 'Customize your oblea with 3 fruits, 2 sauces, and 1 topping included.',
    description_es: 'Personaliza tu oblea con 3 frutas, 2 salsas y 1 topping incluidos.',
    price: 14.00,
    image_url: '/oblea.png',
    is_active: true,
    is_sold_out: false,
    is_featured: true,
    free_toppings_limit: 0,
    display_order: 1,
    created_at: now,
    updated_at: now,
    name_en: 'Oblea Bowl',
    name_es: 'Oblea Bowl',
    is_customizable: true,
    selection_groups: obleaBowlSelectionGroups,
  },
  {
    id: 'pave-milo',
    name: 'Pavé de Milo',
    slug: 'pave-milo',
    description: 'Postre cremoso de Milo, listo para disfrutar.',
    description_en: 'Creamy Milo dessert, ready to enjoy.',
    description_es: 'Postre cremoso de Milo, listo para disfrutar.',
    price: 10.00,
    image_url: '/milo.png',
    is_active: true,
    is_sold_out: false,
    is_featured: true,
    free_toppings_limit: 0,
    display_order: 2,
    created_at: now,
    updated_at: now,
    name_en: 'Milo Pavé',
    name_es: 'Pavé de Milo',
    is_customizable: false,
    selection_groups: [],
  },
  {
    id: 'pave-klim',
    name: 'Pavé de Klim',
    slug: 'pave-klim',
    description: 'Postre cremoso de Klim, suave y delicioso.',
    description_en: 'Creamy Klim dessert, smooth and delicious.',
    description_es: 'Postre cremoso de Klim, suave y delicioso.',
    price: 10.00,
    image_url: '/klim.png',
    is_active: true,
    is_sold_out: false,
    is_featured: true,
    free_toppings_limit: 0,
    display_order: 3,
    created_at: now,
    updated_at: now,
    name_en: 'Klim Pavé',
    name_es: 'Pavé de Klim',
    is_customizable: false,
    selection_groups: [],
  },
]

// Return products with their toppings populated
export function getProductsWithToppings(): Product[] {
  return products.map(p => ({ ...p, toppings: [] }))
}

export function getProductBySlug(slug: string): Product | null {
  const p = products.find(p => p.slug === slug && p.is_active)
  if (!p) return null
  return { ...p, toppings: [] }
}

// ---------------------------------------------------------------------------
// Delivery Zones
// ---------------------------------------------------------------------------

export interface MockZone {
  id: string
  name: string
  is_active: boolean
  delivery_zone_cities: { id: string; zone_id: string; city: string; state: string }[]
  delivery_zone_zip_codes: { id: string; zone_id: string; zip_code: string }[]
}

export let zones: MockZone[] = [
  {
    id: 'zone-a', name: 'Dover', is_active: true,
    delivery_zone_cities: [{ id: 'city-a1', zone_id: 'zone-a', city: 'Dover', state: 'NJ' }],
    delivery_zone_zip_codes: [
      { id: 'zip-a1', zone_id: 'zone-a', zip_code: '07801' },
      { id: 'zip-a2', zone_id: 'zone-a', zip_code: '07802' },
    ],
  },
  {
    id: 'zone-b', name: 'Wharton', is_active: true,
    delivery_zone_cities: [{ id: 'city-b1', zone_id: 'zone-b', city: 'Wharton', state: 'NJ' }],
    delivery_zone_zip_codes: [{ id: 'zip-b1', zone_id: 'zone-b', zip_code: '07885' }],
  },
  {
    id: 'zone-c', name: 'Randolph', is_active: true,
    delivery_zone_cities: [{ id: 'city-c1', zone_id: 'zone-c', city: 'Randolph', state: 'NJ' }],
    delivery_zone_zip_codes: [{ id: 'zip-c1', zone_id: 'zone-c', zip_code: '07869' }],
  },
  {
    id: 'zone-d', name: 'Morris Plains', is_active: true,
    delivery_zone_cities: [
      { id: 'city-d1', zone_id: 'zone-d', city: 'Morris Plains', state: 'NJ' },
      { id: 'city-d2', zone_id: 'zone-d', city: 'Morristown', state: 'NJ' },
    ],
    delivery_zone_zip_codes: [
      { id: 'zip-d1', zone_id: 'zone-d', zip_code: '07950' },
      { id: 'zip-d2', zone_id: 'zone-d', zip_code: '07960' },
    ],
  },
]

// Convert MockZone to DeliveryZone shape used by types
export function zonesAsDeliveryZones(): DeliveryZone[] {
  return zones.map(z => ({
    id: z.id,
    name: z.name,
    is_active: z.is_active,
    cities: z.delivery_zone_cities as DeliveryZoneCity[],
    zip_codes: z.delivery_zone_zip_codes as DeliveryZoneZipCode[],
  }))
}

export function validateZone(city: string, zip: string): MockZone | null {
  const normCity = city.trim().toLowerCase()
  const normZip = zip.trim()
  for (const zone of zones) {
    if (!zone.is_active) continue
    if (zone.delivery_zone_zip_codes.some(z => z.zip_code === normZip)) return zone
    if (zone.delivery_zone_cities.some(c => c.city.toLowerCase() === normCity)) return zone
  }
  return null
}

// ---------------------------------------------------------------------------
// Delivery Dates & Slots
// ---------------------------------------------------------------------------

export let dates: DeliveryDate[] = [
  {
    id: 'date-sat', date: SAT_DATE, day_of_week: 'saturday',
    is_active: true, accepting_orders: true, cutoff_datetime: null,
  },
  {
    id: 'date-sun', date: SUN_DATE, day_of_week: 'sunday',
    is_active: true, accepting_orders: true, cutoff_datetime: null,
  },
]

export let slots: DeliverySlot[] = [
  // Saturday slots
  { id: 'slot-sat-1', delivery_date_id: 'date-sat', start_time: '12:00', end_time: '14:00', is_active: true, is_manually_closed: false, display_order: 1 },
  { id: 'slot-sat-2', delivery_date_id: 'date-sat', start_time: '14:00', end_time: '16:00', is_active: true, is_manually_closed: false, display_order: 2 },
  { id: 'slot-sat-3', delivery_date_id: 'date-sat', start_time: '16:00', end_time: '18:00', is_active: true, is_manually_closed: false, display_order: 3 },
  // Sunday slots
  { id: 'slot-sun-1', delivery_date_id: 'date-sun', start_time: '12:00', end_time: '14:00', is_active: true, is_manually_closed: false, display_order: 1 },
  { id: 'slot-sun-2', delivery_date_id: 'date-sun', start_time: '14:00', end_time: '16:00', is_active: true, is_manually_closed: false, display_order: 2 },
  { id: 'slot-sun-3', delivery_date_id: 'date-sun', start_time: '16:00', end_time: '18:00', is_active: true, is_manually_closed: false, display_order: 3 },
]

export function getSlotsForDate(dateId: string): DeliverySlot[] {
  return slots.filter(s => s.delivery_date_id === dateId && s.is_active)
}

// ---------------------------------------------------------------------------
// Business Settings
// ---------------------------------------------------------------------------

export let settings: Record<string, string> = {
  accepting_orders: 'true',
  delivery_fee: '0.00',
  delivery_enabled: 'true',
  pickup_enabled: 'true',
  same_zone_capacity: '7',
  two_zone_capacity: '5',
  three_plus_zone_capacity: '4',
  zelle_recipient_name: 'The Bowl House',
  zelle_phone_email: 'mariafcuevas05@gmail.com',
  zelle_payment_url: '',
  slot_reservation_minutes: '15',
  pickup_capacity: '10',
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface MockOrderItem extends OrderItem {
  order_item_toppings?: OrderItemTopping[]
  selections?: CartItemSelection[]
}

export interface MockOrder extends Omit<Order, 'items' | 'delivery_date' | 'delivery_slot' | 'pickup_slot'> {
  items?: MockOrderItem[]
  order_items?: MockOrderItem[]
  delivery_slot?: DeliverySlot | null
  pickup_slot?: DeliverySlot | null
  delivery_date?: DeliveryDate | null
}

function makeObleaItem(
  id: string, orderId: string, qty: number,
  selectionDefs: CartItemSelection[]
): MockOrderItem {
  const extraTotal = selectionDefs.filter(s => s.price > 0).reduce((s, sel) => s + sel.price, 0)
  const itemTotal = (14.00 + extraTotal) * qty
  return {
    id, order_id: orderId,
    product_id: 'oblea-bowl', product_name: 'Oblea Bowl',
    product_price: 14.00, quantity: qty, item_total: itemTotal,
    toppings: [], order_item_toppings: [],
    selections: selectionDefs,
  }
}

function makePaveItem(id: string, orderId: string, qty: number): MockOrderItem {
  const itemTotal = 8.00 * qty
  return {
    id, order_id: orderId,
    product_id: 'pave-milo', product_name: 'Pavé de Milo',
    product_price: 10.00, quantity: qty, item_total: itemTotal,
    toppings: [], order_item_toppings: [],
    selections: [],
  }
}

const obleaSelections1: CartItemSelection[] = [
  { group_id: 'frutas', option_id: 'fresa', option_name: 'Fresa', price: 0 },
  { group_id: 'frutas', option_id: 'mango', option_name: 'Mango', price: 0 },
  { group_id: 'frutas', option_id: 'durazno', option_name: 'Durazno', price: 0 },
  { group_id: 'salsas', option_id: 'mora', option_name: 'Mora', price: 0 },
  { group_id: 'salsas', option_id: 'arequipe', option_name: 'Arequipe', price: 0 },
  { group_id: 'toppings', option_id: 'oreo', option_name: 'Oreo', price: 0 },
]

const obleaSelections2: CartItemSelection[] = [
  { group_id: 'frutas', option_id: 'kiwi', option_name: 'Kiwi', price: 0 },
  { group_id: 'frutas', option_id: 'banano', option_name: 'Banano', price: 0 },
  { group_id: 'frutas', option_id: 'cereza', option_name: 'Cereza', price: 0 },
  { group_id: 'salsas', option_id: 'lecherita', option_name: 'Lecherita', price: 0 },
  { group_id: 'salsas', option_id: 'maracuya', option_name: 'Maracuyá', price: 0 },
  { group_id: 'toppings', option_id: 'mini-chips', option_name: 'Mini Chips', price: 0 },
]

const obleaSelections3: CartItemSelection[] = [
  { group_id: 'frutas', option_id: 'fresa', option_name: 'Fresa', price: 0 },
  { group_id: 'frutas', option_id: 'durazno', option_name: 'Durazno', price: 0 },
  { group_id: 'frutas', option_id: 'mango', option_name: 'Mango', price: 0 },
  { group_id: 'salsas', option_id: 'mora', option_name: 'Mora', price: 0 },
  { group_id: 'salsas', option_id: 'nutella', option_name: 'Nutella', price: 0 },
  { group_id: 'toppings', option_id: 'choco-negro', option_name: 'Chocolate negro', price: 0 },
  // extra fruta
  { group_id: 'frutas', option_id: 'guanabana-extra', option_name: 'Guanábana', price: 2 },
]

const NOW = new Date().toISOString()

export let orders: MockOrder[] = [
  // Order 1001 — María García, Dover, Wed 12-2pm, zelle, payment_due, new
  (() => {
    const items: MockOrderItem[] = [makeObleaItem('oi-1001-1', 'ord-1001', 1, obleaSelections1)]
    const subtotal = items.reduce((s, i) => s + i.item_total, 0)
    return {
      id: 'ord-1001', order_number: '1001',
      customer_id: null, customer_first_name: 'María', customer_last_name: 'García',
      customer_phone: '+19735551001', customer_email: null,
      fulfillment_type: 'delivery' as const,
      delivery_date_id: 'date-wed', delivery_slot_id: 'slot-wed-1', pickup_slot_id: null,
      street_address: '123 Blackwell St', apartment: null,
      city: 'Dover', state: 'NJ', zip_code: '07801',
      delivery_instructions: null, delivery_zone_id: 'zone-a', zone_name: 'Dover',
      subtotal, delivery_fee: 3.00, total: subtotal + 3.00,
      payment_method: 'zelle' as const, payment_status: 'payment_due' as const,
      payment_confirmed_at: null, payment_confirmed_by: null,
      payment_request_sent_at: null, payment_request_count: 0,
      last_payment_request_sent_at: null,
      order_status: 'new' as const,
      delivered_at: null, picked_up_at: null, admin_notes: null,
      preferred_language: 'en' as const, created_at: NOW, updated_at: NOW,
      items, order_items: items,
      delivery_slot: slots.find(s => s.id === 'slot-wed-1') || null,
      pickup_slot: null,
      delivery_date: dates.find(d => d.id === 'date-wed') || null,
    }
  })(),

  // Order 1002 — Carlos Méndez, Wharton, Wed 12-2pm, cash, payment_due, confirmed
  (() => {
    const items: MockOrderItem[] = [
      makeObleaItem('oi-1002-1', 'ord-1002', 2, obleaSelections2),
    ]
    const subtotal = items.reduce((s, i) => s + i.item_total, 0)
    return {
      id: 'ord-1002', order_number: '1002',
      customer_id: null, customer_first_name: 'Carlos', customer_last_name: 'Méndez',
      customer_phone: '+19735551002', customer_email: null,
      fulfillment_type: 'delivery' as const,
      delivery_date_id: 'date-wed', delivery_slot_id: 'slot-wed-1', pickup_slot_id: null,
      street_address: '45 N Main St', apartment: null,
      city: 'Wharton', state: 'NJ', zip_code: '07885',
      delivery_instructions: 'Tocar el timbre', delivery_zone_id: 'zone-b', zone_name: 'Wharton',
      subtotal, delivery_fee: 3.00, total: subtotal + 3.00,
      payment_method: 'cash' as const, payment_status: 'payment_due' as const,
      payment_confirmed_at: null, payment_confirmed_by: null,
      payment_request_sent_at: null, payment_request_count: 0,
      last_payment_request_sent_at: null,
      order_status: 'confirmed' as const,
      delivered_at: null, picked_up_at: null, admin_notes: null,
      preferred_language: 'es' as const, created_at: NOW, updated_at: NOW,
      items, order_items: items,
      delivery_slot: slots.find(s => s.id === 'slot-wed-1') || null,
      pickup_slot: null,
      delivery_date: dates.find(d => d.id === 'date-wed') || null,
    }
  })(),

  // Order 1003 — Sofia López, Dover, Wed 2-4pm, zelle, paid, delivered
  (() => {
    const items: MockOrderItem[] = [
      makeObleaItem('oi-1003-1', 'ord-1003', 1, obleaSelections3),
    ]
    const subtotal = items.reduce((s, i) => s + i.item_total, 0)
    return {
      id: 'ord-1003', order_number: '1003',
      customer_id: null, customer_first_name: 'Sofia', customer_last_name: 'López',
      customer_phone: '+19735551003', customer_email: 'sofia@example.com',
      fulfillment_type: 'delivery' as const,
      delivery_date_id: 'date-wed', delivery_slot_id: 'slot-wed-2', pickup_slot_id: null,
      street_address: '78 Prospect St', apartment: 'Apt 2B',
      city: 'Dover', state: 'NJ', zip_code: '07802',
      delivery_instructions: null, delivery_zone_id: 'zone-a', zone_name: 'Dover',
      subtotal, delivery_fee: 3.00, total: subtotal + 3.00,
      payment_method: 'zelle' as const, payment_status: 'paid' as const,
      payment_confirmed_at: NOW, payment_confirmed_by: 'admin',
      payment_request_sent_at: NOW, payment_request_count: 1,
      last_payment_request_sent_at: NOW,
      order_status: 'delivered' as const,
      delivered_at: NOW, picked_up_at: null, admin_notes: null,
      preferred_language: 'es' as const, created_at: NOW, updated_at: NOW,
      items, order_items: items,
      delivery_slot: slots.find(s => s.id === 'slot-wed-2') || null,
      pickup_slot: null,
      delivery_date: dates.find(d => d.id === 'date-wed') || null,
    }
  })(),

  // Order 1004 — Ana Martínez, Morris Plains, Sun 2-4pm, cash, payment_due, preparing
  (() => {
    const items: MockOrderItem[] = [
      makeObleaItem('oi-1004-1', 'ord-1004', 1, obleaSelections1),
      makePaveItem('oi-1004-2', 'ord-1004', 1),
    ]
    const subtotal = items.reduce((s, i) => s + i.item_total, 0)
    return {
      id: 'ord-1004', order_number: '1004',
      customer_id: null, customer_first_name: 'Ana', customer_last_name: 'Martínez',
      customer_phone: '+19735551004', customer_email: null,
      fulfillment_type: 'delivery' as const,
      delivery_date_id: 'date-sun', delivery_slot_id: 'slot-sun-2', pickup_slot_id: null,
      street_address: '1 Hillside Ave', apartment: null,
      city: 'Morris Plains', state: 'NJ', zip_code: '07950',
      delivery_instructions: null, delivery_zone_id: 'zone-d', zone_name: 'Morris Plains',
      subtotal, delivery_fee: 3.00, total: subtotal + 3.00,
      payment_method: 'cash' as const, payment_status: 'payment_due' as const,
      payment_confirmed_at: null, payment_confirmed_by: null,
      payment_request_sent_at: null, payment_request_count: 0,
      last_payment_request_sent_at: null,
      order_status: 'preparing' as const,
      delivered_at: null, picked_up_at: null, admin_notes: null,
      preferred_language: 'es' as const, created_at: NOW, updated_at: NOW,
      items, order_items: items,
      delivery_slot: slots.find(s => s.id === 'slot-sun-2') || null,
      pickup_slot: null,
      delivery_date: dates.find(d => d.id === 'date-sun') || null,
    }
  })(),

  // Order 1005 — James Wilson, Randolph, Sun 12-2pm, zelle, payment_due, new
  (() => {
    const items: MockOrderItem[] = [makePaveItem('oi-1005-1', 'ord-1005', 2)]
    const subtotal = items.reduce((s, i) => s + i.item_total, 0)
    return {
      id: 'ord-1005', order_number: '1005',
      customer_id: null, customer_first_name: 'James', customer_last_name: 'Wilson',
      customer_phone: '+19735551005', customer_email: null,
      fulfillment_type: 'delivery' as const,
      delivery_date_id: 'date-sun', delivery_slot_id: 'slot-sun-1', pickup_slot_id: null,
      street_address: '200 Center Grove Rd', apartment: null,
      city: 'Randolph', state: 'NJ', zip_code: '07869',
      delivery_instructions: null, delivery_zone_id: 'zone-c', zone_name: 'Randolph',
      subtotal, delivery_fee: 3.00, total: subtotal + 3.00,
      payment_method: 'zelle' as const, payment_status: 'payment_due' as const,
      payment_confirmed_at: null, payment_confirmed_by: null,
      payment_request_sent_at: null, payment_request_count: 0,
      last_payment_request_sent_at: null,
      order_status: 'new' as const,
      delivered_at: null, picked_up_at: null, admin_notes: null,
      preferred_language: 'en' as const, created_at: NOW, updated_at: NOW,
      items, order_items: items,
      delivery_slot: slots.find(s => s.id === 'slot-sun-1') || null,
      pickup_slot: null,
      delivery_date: dates.find(d => d.id === 'date-sun') || null,
    }
  })(),
]

// ---------------------------------------------------------------------------
// Order helpers
// ---------------------------------------------------------------------------

export function getOrderById(id: string): MockOrder | null {
  return orders.find(o => o.id === id) || null
}

export function getOrderByNumber(orderNumber: string): MockOrder | null {
  return orders.find(o => o.order_number === orderNumber) || null
}

export function updateOrder(id: string, patch: Partial<MockOrder>): MockOrder | null {
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return null
  orders[idx] = { ...orders[idx], ...patch, updated_at: new Date().toISOString() }
  return orders[idx]
}

export function createOrder(data: MockOrder): MockOrder {
  orders.push(data)
  return data
}

export function deleteOrder(id: string): boolean {
  const idx = orders.findIndex(o => o.id === id)
  if (idx === -1) return false
  orders.splice(idx, 1)
  return true
}

export function nextOrderNumber(): string {
  const nums = orders.map(o => parseInt(o.order_number)).filter(n => !isNaN(n))
  const max = nums.length ? Math.max(...nums) : 1000
  return String(max + 1)
}

// ---------------------------------------------------------------------------
// Slot capacity logic
// ---------------------------------------------------------------------------

export function calcSlotCapacity(
  slotId: string,
  incomingZoneId: string | null
): { available: boolean; current: number; capacity: number; zonesPresent: number } {
  const slot = slots.find(s => s.id === slotId)
  if (!slot || slot.is_manually_closed) {
    return { available: false, current: 0, capacity: 0, zonesPresent: 0 }
  }

  const slotOrders = orders.filter(
    o => o.delivery_slot_id === slotId && o.order_status !== 'cancelled'
  )

  const existingZoneIds = slotOrders
    .map(o => o.delivery_zone_id)
    .filter((z): z is string => !!z)

  const hypotheticalZones = incomingZoneId
    ? [...existingZoneIds, incomingZoneId]
    : existingZoneIds

  const uniqueZones = new Set(hypotheticalZones.filter(Boolean))
  const zoneCount = uniqueZones.size

  const sameZone = parseInt(settings.same_zone_capacity || '7')
  const twoZones = parseInt(settings.two_zone_capacity || '5')
  const threePlus = parseInt(settings.three_plus_zone_capacity || '4')

  let capacity: number
  if (zoneCount <= 1) capacity = sameZone
  else if (zoneCount === 2) capacity = twoZones
  else capacity = threePlus

  const current = slotOrders.length

  return { available: current < capacity, current, capacity, zonesPresent: zoneCount }
}
