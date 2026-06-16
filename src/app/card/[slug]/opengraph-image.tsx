import { ImageResponse } from 'next/og'
import { getCard } from '@/lib/cards'

export const alt = 'Une surprise t’attend sur DadDrop'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const card = await getCard(slug)
  const sender = card?.sender_name ?? 'Quelqu’un'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1c1917 50%, #0a0a0a 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '60px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', fontSize: 140, marginBottom: 24 }}>💌</div>

        <div style={{ display: 'flex', fontSize: 30, color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>
          UNE SURPRISE T&apos;ATTEND
        </div>

        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, lineHeight: 1.15 }}>
          {`${sender} t'a préparé`}
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#fbbf24', lineHeight: 1.15 }}>
          quelque chose 🎁
        </div>

        <div style={{ display: 'flex', fontSize: 30, color: '#a1a1aa', marginTop: 32 }}>
          Appuie pour ouvrir ton lien
        </div>

        <div style={{ display: 'flex', fontSize: 28, color: '#71717a', marginTop: 48, fontWeight: 700 }}>
          DadDrop · fête des pères
        </div>
      </div>
    ),
    { ...size }
  )
}
