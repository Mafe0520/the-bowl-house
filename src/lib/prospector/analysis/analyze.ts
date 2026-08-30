import Anthropic from '@anthropic-ai/sdk'
import { computeScore } from './scoring'
import type { Prospect } from '../types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CLASSIFY_TOOL: Anthropic.Tool = {
  name: 'classify_prospect',
  description: 'Classify a web search result as a potential lead for a custom order management system service targeting small businesses.',
  input_schema: {
    type: 'object' as const,
    required: [
      'is_small_business','business_type','country','language','pain_detected',
      'pain_type','intention_level','current_system','website_status',
      'solution_suggestion','contactability','why_good_prospect','insufficient_context',
      'score_pain','score_intention','score_fit','score_contactability',
      'score_freshness','score_willingness',
    ],
    properties: {
      is_small_business:   { type: 'string', enum: ['yes','no','unknown'] },
      business_name:       { type: 'string' },
      business_type:       { type: 'string', enum: ['home_baker','reposteria','catering','florist','meal_prep','gift','restaurant','food_vendor','other'] },
      country:             { type: 'string' },
      language:            { type: 'string', enum: ['en','es'] },
      pain_detected:       { type: 'string' },
      pain_type:           { type: 'string', enum: ['pedidos_dm','desorganizacion','pedidos_perdidos','personalizacion','fechas_pickup','control_disponibilidad','pagos','falta_website','plataforma_cara','google_forms','otro'] },
      intention_level:     { type: 'string', enum: ['exploring','complaining','seeking_recommendation','seeking_solution','seeking_provider','willing_to_pay'] },
      current_system:      { type: 'array', items: { type: 'string' } },
      website_status:      { type: 'string', enum: ['none','instagram_only','whatsapp_only','google_forms','basic_website','ecommerce','unknown'] },
      solution_suggestion: { type: 'string' },
      contactability:      { type: 'string', enum: ['high','medium','low'] },
      author_name:         { type: 'string' },
      author_url:          { type: 'string' },
      why_good_prospect:   { type: 'string' },
      insufficient_context:{ type: 'boolean' },
      score_pain:          { type: 'number', minimum: 0, maximum: 100 },
      score_intention:     { type: 'number', minimum: 0, maximum: 100 },
      score_fit:           { type: 'number', minimum: 0, maximum: 100 },
      score_contactability:{ type: 'number', minimum: 0, maximum: 100 },
      score_freshness:     { type: 'number', minimum: 0, maximum: 100 },
      score_willingness:   { type: 'number', minimum: 0, maximum: 100 },
    },
  },
}

const SYSTEM_PROMPT = `You analyze web search results to identify small business owners who need a custom order management system.

The service helps businesses that take custom orders (bakeries, florists, meal prep, catering, gift shops) replace WhatsApp/DM-based ordering with an organized system.

CRITICAL RULES:
- NEVER invent contact info (email, phone, social). Only return author_url if explicitly present in the content.
- Set insufficient_context=true if the snippet is too short (<80 chars) or too vague to analyze reliably. Lower all scores when insufficient_context=true.
- A score of 85+ means genuinely excellent: clear pain, active search for a solution, contactable. Don't inflate.
- score_pain: how severe and real is the ordering pain (0-100)
- score_intention: how actively are they seeking a solution (0-100)
- score_fit: how well do they fit the target profile (0-100)
- score_contactability: how reachable are they via public info (0-100)
- score_freshness: how recent is the content (0=old, 100=very recent)
- score_willingness: signals they would pay for a solution (0-100)`

export async function analyzeProspect(prospect: Pick<Prospect, 'title' | 'snippet' | 'source_url' | 'source_domain' | 'source_bonus'>): Promise<Partial<Prospect> | null> {
  const content = [
    `URL: ${prospect.source_url}`,
    `Source: ${prospect.source_domain}`,
    `Title: ${prospect.title ?? '(none)'}`,
    `Snippet: ${prospect.snippet ?? '(none)'}`,
  ].join('\n')

  try {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      tools:      [CLASSIFY_TOOL],
      tool_choice:{ type: 'tool', name: 'classify_prospect' },
      messages:   [{ role: 'user', content }],
    })

    const toolUse = response.content.find(b => b.type === 'tool_use')
    if (!toolUse || toolUse.type !== 'tool_use') return null

    const inp = toolUse.input as Record<string, unknown>
    const scoreInputs = {
      score_pain:          Number(inp.score_pain)          || 0,
      score_intention:     Number(inp.score_intention)     || 0,
      score_fit:           Number(inp.score_fit)           || 0,
      score_contactability:Number(inp.score_contactability)|| 0,
      score_freshness:     Number(inp.score_freshness)     || 0,
      score_willingness:   Number(inp.score_willingness)   || 0,
      source_bonus:        prospect.source_bonus           || 0,
    }

    const { score, score_category } = computeScore(scoreInputs)

    return {
      is_small_business:    inp.is_small_business as any,
      business_name:        (inp.business_name as string) || null,
      business_type:        inp.business_type as any || null,
      country:              (inp.country as string) || null,
      language:             inp.language as any || null,
      pain_detected:        (inp.pain_detected as string) || null,
      pain_type:            inp.pain_type as any || null,
      intention_level:      inp.intention_level as any || null,
      current_system:       (inp.current_system as string[]) || [],
      website_status:       inp.website_status as any || 'unknown',
      solution_suggestion:  (inp.solution_suggestion as string) || null,
      contactability:       inp.contactability as any || 'low',
      author_name:          (inp.author_name as string) || null,
      author_url:           (inp.author_url as string) || null,
      why_good_prospect:    (inp.why_good_prospect as string) || null,
      insufficient_context: Boolean(inp.insufficient_context),
      ...scoreInputs,
      score,
      score_category,
      analyzed:    true,
      analyzed_at: new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export async function analyzeBatch(
  prospects: Pick<Prospect, 'id' | 'title' | 'snippet' | 'source_url' | 'source_domain' | 'source_bonus'>[],
  onProgress?: (done: number, total: number) => void
): Promise<{ id: string; result: Partial<Prospect> | null }[]> {
  const results = []
  for (let i = 0; i < prospects.length; i++) {
    const result = await analyzeProspect(prospects[i])
    results.push({ id: prospects[i].id, result })
    onProgress?.(i + 1, prospects.length)
  }
  return results
}

export async function generateApproach(prospect: Prospect): Promise<string> {
  const isSpanish = prospect.language === 'es'
  const context = [
    `Platform: ${prospect.source_domain}`,
    `Business: ${prospect.business_name || 'small business owner'}`,
    `Pain: ${prospect.pain_detected || prospect.pain_type}`,
    `Intention: ${prospect.intention_level}`,
    `Snippet: "${prospect.snippet}"`,
  ].join('\n')

  const systemPrompt = isSpanish
    ? `Eres un vendedor directo especializado en mini apps para negocios pequeños. Escribe un mensaje de venta directo para enviar por DM o comentario al dueño de este negocio.
       El mensaje debe: presentarte brevemente, mencionar el problema específico que tiene su negocio, ofrecer directamente una mini app personalizada de gestión de pedidos (similar a la que ya usas en tu propio negocio), incluir una llamada a la acción clara (responder si le interesa o agendar una llamada). Máximo 5 oraciones. En español. Tono profesional pero cercano, no genérico.`
    : `You are a direct salesperson specializing in custom mini apps for small businesses. Write a direct sales DM or comment for this business owner.
       The message must: briefly introduce yourself, reference their specific business problem, directly offer a custom order management mini app (like the one you already use in your own business), include a clear call to action (reply if interested or book a call). Max 5 sentences. Professional but approachable tone, not generic.`

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 300,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: context }],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}
