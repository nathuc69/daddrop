import { cache } from 'react'
import { createServiceClient } from '@/lib/supabase'
import type { Card } from '@/lib/types'

export const DEMO_CARD: Card = {
  id: 'demo',
  created_at: new Date().toISOString(),
  sender_name: 'Léa',
  recipient_name: 'Papa',
  message:
    'Papa,\n\nJe voulais juste te dire que tu es le meilleur papa du monde. Merci pour tout ce que tu fais pour nous, pour ta patience, tes blagues nulles (que j\'adore quand même 😄), et ton amour sans limite.\n\nBonne fête des pères ! 💛',
  photo_url: null,
  theme: 'fete_des_peres',
}

// Cached per request: dedupes the lookup across generateMetadata + the page render.
export const getCard = cache(async (slug: string): Promise<Card | null> => {
  if (slug === 'demo') return DEMO_CARD
  const db = createServiceClient()
  const { data, error } = await db.from('cards').select('*').eq('id', slug).single()
  if (error || !data) return null
  return data as Card
})
