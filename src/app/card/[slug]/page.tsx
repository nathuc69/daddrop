import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CardRevealClient from './CardRevealClient'
import { getCard } from '@/lib/cards'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const card = await getCard(slug)
  if (!card) return { title: 'Lien introuvable · DadDrop' }

  // Personalised preview — without revealing the message (keep the surprise).
  const title = `${card.sender_name} t'a préparé une surprise 🎁`
  const description = 'Ouvre ton lien pour découvrir le message. Fête des pères · DadDrop'
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const card = await getCard(slug)
  if (!card) notFound()

  return <CardRevealClient card={card} isDemo={slug === 'demo'} />
}
