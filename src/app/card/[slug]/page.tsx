import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import CardRevealClient from './CardRevealClient'
import { Card } from '@/lib/types'

const DEMO_CARD: Card = {
  id: 'demo',
  created_at: new Date().toISOString(),
  sender_name: 'Léa',
  recipient_name: 'Papa',
  message:
    'Papa,\n\nJe voulais juste te dire que tu es le meilleur papa du monde. Merci pour tout ce que tu fais pour nous, pour ta patience, tes blagues nulles (que j\'adore quand même 😄), et ton amour sans limite.\n\nBonne fête des pères ! 💛',
  photo_url: null,
  theme: 'fete_des_peres',
}

async function getCard(slug: string): Promise<Card | null> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('cards')
    .select('*')
    .eq('id', slug)
    .single()
  if (error || !data) return null
  return data as Card
}


export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === 'demo') {
    return <CardRevealClient card={DEMO_CARD} isDemo />
  }

  const card = await getCard(slug)
  if (!card) notFound()

  return <CardRevealClient card={card!} isDemo={false} />
}
