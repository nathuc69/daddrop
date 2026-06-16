'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Card } from '@/lib/types'
import { trackEvent } from '@/lib/analytics'
import Link from 'next/link'

type Phase = 'teaser' | 'shake' | 'opening' | 'reveal' | 'done'

export default function RevealAnimation({ card }: { card: Card }) {
  const [phase, setPhase] = useState<Phase>('teaser')
  const [imgLoaded, setImgLoaded] = useState(false)
  const confettiFired = useRef(false)

  useEffect(() => {
    if (!card.photo_url) { setImgLoaded(true); return }
    const img = new Image()
    img.src = card.photo_url
    img.onload = () => setImgLoaded(true)
    img.onerror = () => setImgLoaded(true)
  }, [card.photo_url])

  const fireConfetti = useCallback(() => {
    if (confettiFired.current) return
    confettiFired.current = true
    const end = Date.now() + 2500
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#fde68a', '#fff', '#ff6b6b'] })
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#fde68a', '#fff', '#ff6b6b'] })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  function handleTap() {
    if (phase !== 'teaser') return
    if (navigator.vibrate) navigator.vibrate([20, 40, 20])
    setPhase('shake')
    setTimeout(() => setPhase('opening'), 500)
    setTimeout(() => { setPhase('reveal'); fireConfetti(); trackEvent('reveal_completed', card.id) }, 2000)
    setTimeout(() => setPhase('done'), 2800)
  }

  const recipientLabel = card.recipient_name ? `Pour ${card.recipient_name}` : 'Pour toi 💛'

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-8">

      {phase === 'teaser' && (
        <div className="flex flex-col items-center gap-8 animate-fade-in-up" onClick={handleTap}>
          <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase">{recipientLabel}</p>
          <Envelope phase="idle" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg text-zinc-300 font-medium">{card.sender_name} t&apos;a préparé quelque chose</p>
            <p className="text-sm text-zinc-500">Une surprise rien que pour toi</p>
          </div>
          <button
            onClick={handleTap}
            className="mt-2 animate-pulse-glow rounded-full bg-amber-400 px-10 py-4 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-300 active:scale-95"
          >
            Appuie pour ouvrir ✨
          </button>
        </div>
      )}

      {(phase === 'shake' || phase === 'opening') && (
        <div className="flex flex-col items-center gap-8">
          <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase animate-fade-in-up">{recipientLabel}</p>
          <Envelope phase={phase} />
          {phase === 'opening' && (
            <p className="text-zinc-400 animate-fade-in-up text-sm tracking-wide">En train d&apos;ouvrir…</p>
          )}
        </div>
      )}

      {(phase === 'reveal' || phase === 'done') && (
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center animate-fade-in-up">
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-2">
              🎁 {card.sender_name} t&apos;écrit…
            </p>
            {card.recipient_name && (
              <p className="text-xl font-bold text-white">Pour {card.recipient_name}</p>
            )}
          </div>

          <div
            className="rounded-3xl bg-zinc-800/80 backdrop-blur-sm p-6 ring-1 ring-white/10 shadow-2xl"
            style={{ animation: 'reveal-content 0.7s ease-out 0.1s both' }}
          >
            <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{card.message}</p>
          </div>

          {card.photo_url && imgLoaded && (
            <div
              className="rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl"
              style={{ animation: 'reveal-content 0.7s ease-out 0.4s both' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.photo_url} alt="Photo partagée" className="w-full object-cover max-h-80" />
            </div>
          )}

          <p
            className="text-center text-amber-400 font-semibold text-lg"
            style={{ animation: 'reveal-content 0.7s ease-out 0.65s both' }}
          >
            — {card.sender_name} 💛
          </p>

          {phase === 'done' && (
            <div
              className="mt-2 flex flex-col gap-3 text-center"
              style={{ animation: 'reveal-content 0.7s ease-out 1.1s both' }}
            >
              <p className="text-sm text-zinc-400">Tu veux en créer une pour quelqu&apos;un ?</p>
              <Link
                href="/create"
                onClick={() => trackEvent('loop_create_started', card.id)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 active:scale-95"
              >
                Crée la tienne →
              </Link>
              <p className="mt-1 text-xs text-zinc-700">DadDrop · fait avec ❤️</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Envelope({ phase }: { phase: 'idle' | 'shake' | 'opening' }) {
  return (
    <div className="relative" style={{ perspective: '900px' }}>
      {/* Ambient glow that expands when opening */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-700"
        style={{
          boxShadow: phase === 'opening'
            ? '0 0 80px 30px rgba(251,191,36,0.25)'
            : '0 0 30px 8px rgba(251,191,36,0.08)',
        }}
      />

      {/* Envelope body */}
      <div
        className="relative w-56 h-40 rounded-3xl bg-zinc-800 border-2 border-zinc-700 shadow-2xl overflow-hidden"
        style={{
          animation: phase === 'shake' ? 'shake 0.45s ease-in-out' : undefined,
          borderColor: phase === 'opening' ? 'rgba(251,191,36,0.5)' : undefined,
          transition: 'border-color 0.4s',
        }}
      >
        {/* Bottom V chevron */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0"
          style={{
            borderLeft: '112px solid transparent',
            borderRight: '112px solid transparent',
            borderBottom: '52px solid rgba(251,191,36,0.07)',
          }}
        />

        {/* Inner light burst when opening */}
        {phase === 'opening' && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingTop: '16px' }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.9) 0%, rgba(251,191,36,0) 70%)',
                animation: 'burst 1.1s ease-out 0.5s both',
                opacity: 0,
              }}
            />
          </div>
        )}

        {/* Seal (idle only) */}
        {phase === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '14px' }}>
            <div className="w-10 h-10 rounded-full bg-amber-400/15 border-2 border-amber-400/40 flex items-center justify-center shadow-inner">
              <span className="text-base leading-none">💛</span>
            </div>
          </div>
        )}
      </div>

      {/* Flap — sits on top of the body, rotates open */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '-2px',
          height: '68px',
          transformOrigin: 'center top',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          background: phase === 'idle'
            ? 'linear-gradient(160deg, #a16207 0%, #78350f 100%)'
            : 'linear-gradient(160deg, #fbbf24 0%, #d97706 100%)',
          borderRadius: '22px 22px 0 0',
          zIndex: 10,
          animation: phase === 'shake'
            ? 'shake 0.45s ease-in-out'
            : phase === 'opening'
            ? 'open-lid 0.75s cubic-bezier(0.4, 0, 0.2, 1) 0.15s forwards'
            : undefined,
          transition: 'background 0.3s',
        }}
      />
    </div>
  )
}
