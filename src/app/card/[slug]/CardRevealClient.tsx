'use client'

import { useEffect } from 'react'
import RevealAnimation from '@/components/RevealAnimation'
import { Card } from '@/lib/types'
import { trackEvent, isCreator } from '@/lib/analytics'

export default function CardRevealClient({
  card,
  isDemo,
}: {
  card: Card
  isDemo: boolean
}) {
  useEffect(() => {
    if (isDemo) return
    if (!isCreator(card.id)) {
      trackEvent('card_opened', card.id)
    }
  }, [card.id, isDemo])

  return <RevealAnimation card={card} />
}
