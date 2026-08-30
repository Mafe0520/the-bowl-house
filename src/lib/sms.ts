import type { Lang } from '@/lib/i18n/translations'

interface SMSOptions {
  to: string
  body: string
}

export async function sendSMS({ to, body }: SMSOptions): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) return false
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
      }
    )
    if (!res.ok) {
      const err = await res.text()
      console.error('[SMS failed]', res.status, err)
    }
    return res.ok
  } catch (e) {
    console.error('[SMS error]', e)
    return false
  }
}

export function orderConfirmationSMS(
  orderNumber: string,
  dayLabel: string,
  slotLabel: string,
  total: string,
  paymentMethod: string,
  fulfillmentType: string,
  lang: Lang = 'en'
): string {
  const num = orderNumber
  if (lang === 'es') {
    const payLine = paymentMethod === 'zelle'
      ? `Pago: Zelle al momento de la ${fulfillmentType === 'delivery' ? 'entrega' : 'recogida'}.`
      : `Pago: Efectivo al momento de la ${fulfillmentType === 'delivery' ? 'entrega' : 'recogida'}.`
    return `The Bowl House 🍨\n¡Recibimos tu pedido #${num}! 💗\nTu ${fulfillmentType === 'delivery' ? 'entrega está programada' : 'recogida está programada'} para ${dayLabel} entre ${slotLabel}.\nTotal: $${total}\n${payLine}\n¡Gracias!`
  }
  const payLine = paymentMethod === 'zelle'
    ? `Payment: Zelle at ${fulfillmentType}.`
    : `Payment: Cash at ${fulfillmentType}.`
  return `The Bowl House 🍨\nWe got your order #${num}! 💗\nYour ${fulfillmentType} is scheduled for ${dayLabel} between ${slotLabel}.\nTotal: $${total}\n${payLine}\nThank you!`
}

export function zellePaymentRequestSMS(
  orderNumber: string,
  total: string,
  zelleName: string,
  zelleContact: string,
  zelleUrl?: string,
  lang: Lang = 'en'
): string {
  const urlLine = zelleUrl ? `\n${lang === 'es' ? 'Envía aquí' : 'Send here'}: ${zelleUrl}` : ''
  const num = orderNumber
  if (lang === 'es') {
    return `The Bowl House 🍨\nTu pedido #${num} ha sido entregado. 💗\nTotal pendiente: $${total}\nPor favor envía tu pago por Zelle a:\n${zelleName} — ${zelleContact}${urlLine}\nIncluye ${num} en la nota del pago.\n¡Gracias! 🍨`
  }
  return `The Bowl House 🍨\nYour order #${num} has been delivered. 💗\nAmount due: $${total}\nPlease send your Zelle payment to:\n${zelleName} — ${zelleContact}${urlLine}\nPlease include ${num} in the Zelle memo.\nThank you! 🍨`
}

export function paymentReceivedSMS(orderNumber: string, lang: Lang = 'en'): string {
  const num = orderNumber
  if (lang === 'es') {
    return `¡Pago recibido! 💗 Gracias por tu pago del pedido #${num} de The Bowl House. ¡Esperamos que lo hayas disfrutado! 🍨`
  }
  return `Payment received! 💗 Thank you for your payment for The Bowl House order #${num}. We hope you loved it! 🍨`
}
