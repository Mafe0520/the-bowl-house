import type { ContactLead } from './types'

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN!
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!

export async function sendLeadNotification(lead: ContactLead) {
  if (!TOKEN || !CHAT_ID) return

  const lines = [
    `🎯 *Nuevo lead — Prospector*`,
    ``,
    `👤 *${lead.name}*${lead.business_name ? ` — ${lead.business_name}` : ''}`,
    lead.what_sells ? `🛍 Vende: ${lead.what_sells}` : '',
    lead.phone  ? `📱 ${lead.phone}`  : '',
    lead.email  ? `📧 ${lead.email}`  : '',
    lead.current_methods?.length  ? `📋 Método actual: ${lead.current_methods.join(', ')}` : '',
    lead.wants_to_improve?.length ? `✨ Quiere mejorar: ${lead.wants_to_improve.join(', ')}` : '',
    lead.more_info ? `\n💬 "${lead.more_info}"` : '',
  ].filter(Boolean).join('\n')

  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    CHAT_ID,
      text:       lines,
      parse_mode: 'Markdown',
    }),
  }).catch(() => {}) // non-blocking — never throw
}
