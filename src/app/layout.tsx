import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
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
