'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

export default function LandingPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    trackEvent('landing_view', undefined, params.get('utm_source') ?? document.referrer ?? undefined)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
        🎁 Fête des pères — 21 juin
      </div>

      {/* Hero */}
      <h1 className="max-w-sm text-4xl font-bold leading-tight text-white sm:text-5xl">
        Une surprise<br />
        <span className="text-amber-400">inoubliable</span><br />
        pour ton papa
      </h1>

      <p className="mt-4 max-w-xs text-lg text-zinc-400">
        Crée une carte magique en 2 minutes. Il reçoit un lien. Il n&apos;est pas prêt.
      </p>

      {/* CTA */}
      <Link
        href="/create"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-4 text-lg font-bold text-zinc-950 shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-300 hover:shadow-amber-400/40 active:scale-95"
      >
        Crée une surprise pour ton papa →
      </Link>

      {/* Demo link */}
      <Link
        href="/card/demo"
        className="mt-4 text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-300 transition-colors"
      >
        Voir la démo
      </Link>

      {/* How it works */}
      <div className="mt-20 grid max-w-sm gap-6 text-left">
        <Step n="1" title="Tu écris ton message" desc="Un texte du cœur, une photo optionnelle." />
        <Step n="2" title="Tu envoies le lien" desc="Par SMS, WhatsApp, ou ce qui te convient." />
        <Step n="3" title="Il vit la révélation" desc="Une animation surprise qu'il n'a jamais vue." />
      </div>

      {/* Envelope preview illustration */}
      <div className="mt-20 animate-float text-8xl select-none" aria-hidden>
        💌
      </div>
      <p className="mt-3 text-xs text-zinc-600">Gratuit · Sans inscription · 2 minutes</p>

      {/* Watermark */}
      <footer className="mt-16 text-xs text-zinc-700">
        DadDrop · fait avec ❤️
      </footer>
    </main>
  )
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-sm font-bold text-amber-400">
        {n}
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-sm text-zinc-400">{desc}</p>
      </div>
    </div>
  )
}
