'use client'

import { EventType } from './types'

const SESSION_KEY = 'daddrop_session'

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function markAsCreator(cardId: string) {
  localStorage.setItem(`daddrop_created_${cardId}`, '1')
}

export function isCreator(cardId: string): boolean {
  return localStorage.getItem(`daddrop_created_${cardId}`) === '1'
}

export async function trackEvent(
  type: EventType,
  cardId?: string,
  source?: string
) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        card_id: cardId ?? null,
        session_id: getSessionId(),
        source: source ?? getSource(),
      }),
    })
  } catch {
    // analytics must never break the UX
  }
}

function getSource(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_source') ?? document.referrer ?? null
}
