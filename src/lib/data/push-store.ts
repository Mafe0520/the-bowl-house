export interface PushSubscriptionRecord {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

const subscriptions: PushSubscriptionRecord[] = []

export function addSubscription(sub: PushSubscriptionRecord) {
  const exists = subscriptions.findIndex(s => s.endpoint === sub.endpoint)
  if (exists >= 0) {
    subscriptions[exists] = sub
  } else {
    subscriptions.push(sub)
  }
}

export function removeSubscription(endpoint: string) {
  const idx = subscriptions.findIndex(s => s.endpoint === endpoint)
  if (idx >= 0) subscriptions.splice(idx, 1)
}

export function getSubscriptions(): PushSubscriptionRecord[] {
  return [...subscriptions]
}
