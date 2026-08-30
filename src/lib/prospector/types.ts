export type BusinessType =
  | 'home_baker' | 'reposteria' | 'catering' | 'florist'
  | 'meal_prep' | 'gift' | 'restaurant' | 'food_vendor' | 'other'

export type PainType =
  | 'pedidos_dm' | 'desorganizacion' | 'pedidos_perdidos' | 'personalizacion'
  | 'fechas_pickup' | 'control_disponibilidad' | 'pagos' | 'falta_website'
  | 'plataforma_cara' | 'google_forms' | 'otro'

export type IntentionLevel =
  | 'exploring' | 'complaining' | 'seeking_recommendation'
  | 'seeking_solution' | 'seeking_provider' | 'willing_to_pay'

export type WebsiteStatus =
  | 'none' | 'instagram_only' | 'whatsapp_only' | 'google_forms'
  | 'basic_website' | 'ecommerce' | 'unknown'

export type Contactability = 'high' | 'medium' | 'low'
export type ScoreCategory  = 'excellent' | 'good' | 'possible' | 'low'

export type ProspectStatus =
  | 'new' | 'reviewed' | 'commented' | 'contacted'
  | 'replied' | 'not_interested' | 'client' | 'ignore'

export type LeadStatus = 'new' | 'reviewed' | 'contacted' | 'client'

export interface Prospect {
  id: string
  source_type: string
  source_domain: string | null
  source_url: string
  title: string | null
  snippet: string | null
  full_text: string | null
  published_date: string | null
  author_name: string | null
  author_url: string | null
  is_small_business: 'yes' | 'no' | 'unknown'
  business_name: string | null
  business_type: BusinessType | null
  country: string | null
  language: 'en' | 'es' | null
  pain_detected: string | null
  pain_type: PainType | null
  intention_level: IntentionLevel | null
  current_system: string[]
  website_status: WebsiteStatus
  solution_suggestion: string | null
  contactability: Contactability
  why_good_prospect: string | null
  insufficient_context: boolean
  score_pain: number
  score_intention: number
  score_fit: number
  score_contactability: number
  score_freshness: number
  score_willingness: number
  source_bonus: number
  score: number
  score_category: ScoreCategory
  analyzed: boolean
  pre_filtered: boolean
  status: ProspectStatus
  notes: string | null
  created_at: string
  analyzed_at: string | null
}

export interface ContactLead {
  id: string
  name: string
  phone: string | null
  email: string | null
  business_name: string | null
  what_sells: string | null
  current_methods: string[]
  wants_to_improve: string[]
  more_info: string | null
  status: LeadStatus
  created_at: string
}

export interface ProspectorSource {
  id: string
  name: string
  domain: string
  site_filter: string
  source_bonus: number
  is_active: boolean
  notes: string | null
  created_at: string
}

export interface SearchConfigItem {
  id: string
  config_type: 'keyword_intention' | 'industry' | 'region'
  text: string
  language: 'en' | 'es' | 'both'
  is_active: boolean
  created_at: string
}

export interface ScanRun {
  id: string
  queries_generated: number
  results_fetched: number
  pre_filtered_out: number
  analyzed_count: number
  saved_count: number
  error: string | null
  started_at: string
  completed_at: string | null
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'possible'
  return 'low'
}

export const INTENTION_LABELS: Record<IntentionLevel, string> = {
  exploring:               'Explorando',
  complaining:             'Se queja del problema',
  seeking_recommendation:  'Buscando recomendación',
  seeking_solution:        'Buscando solución',
  seeking_provider:        '🔥 Buscando proveedor',
  willing_to_pay:          '💰 Dispuesto a pagar',
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  home_baker:  'Home Bakery',
  reposteria:  'Repostería / Pastelería',
  catering:    'Catering',
  florist:     'Floristería',
  meal_prep:   'Meal Prep',
  gift:        'Regalos / Detalles',
  restaurant:  'Restaurante',
  food_vendor: 'Food Vendor',
  other:       'Otro',
}

export const WEBSITE_STATUS_LABELS: Record<WebsiteStatus, string> = {
  none:           '❌ Sin website',
  instagram_only: '⚠️ Solo Instagram',
  whatsapp_only:  '⚠️ Solo WhatsApp',
  google_forms:   '⚠️ Google Forms',
  basic_website:  '⚠️ Website básico',
  ecommerce:      '✅ Ecommerce',
  unknown:        '— Desconocido',
}

export const PAIN_TYPE_LABELS: Record<PainType, string> = {
  pedidos_dm:             'Pedidos por DM / WhatsApp',
  desorganizacion:        'Desorganización general',
  pedidos_perdidos:       'Pedidos perdidos',
  personalizacion:        'Personalización complicada',
  fechas_pickup:          'Fechas / Pickup / Delivery',
  control_disponibilidad: 'Control de disponibilidad',
  pagos:                  'Manejo de pagos',
  falta_website:          'Falta de website',
  plataforma_cara:        'Plataforma demasiado cara',
  google_forms:           'Google Forms insuficiente',
  otro:                   'Otro problema',
}
