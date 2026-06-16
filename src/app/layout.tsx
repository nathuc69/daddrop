import type { Metadata } from 'next'
import './globals.css'

// Absolute base for resolving OG/Twitter image URLs.
// VERCEL_PROJECT_PRODUCTION_URL is set automatically by Vercel to the prod domain.
const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'DadDrop — Une surprise pour la fête des pères',
  description: 'Crée une carte surprise personnalisée pour ton papa. Un lien magique, une révélation inoubliable.',
  openGraph: {
    title: 'DadDrop — Une surprise pour la fête des pères',
    description: 'Crée une carte surprise personnalisée pour ton papa.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
