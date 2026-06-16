import { ImageResponse } from 'next/og'

export const alt = 'DadDrop — Une surprise inoubliable pour ton papa'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#fbbf24',
            border: '2px solid rgba(251,191,36,0.4)',
            borderRadius: 999,
            padding: '10px 28px',
            marginBottom: 48,
          }}
        >
          🎁 Fête des pères · 21 juin
        </div>

        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>
          Une surprise inoubliable
        </div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, color: '#fbbf24', lineHeight: 1.1 }}>
          pour ton papa
        </div>

        <div style={{ display: 'flex', fontSize: 32, color: '#a1a1aa', marginTop: 32 }}>
          Crée une carte magique en 2 minutes
        </div>

        <div style={{ display: 'flex', fontSize: 30, color: '#71717a', marginTop: 56, fontWeight: 700 }}>
          DadDrop
        </div>
      </div>
    ),
    { ...size }
  )
}
