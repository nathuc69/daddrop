'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PhotoUpload from '@/components/PhotoUpload'
import { trackEvent, markAsCreator } from '@/lib/analytics'

type Step = 'form' | 'share'

type FormData = {
  senderName: string
  recipientName: string
  message: string
  photoUrl: string | null
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormData>({
    senderName: '',
    recipientName: '',
    message: '',
    photoUrl: null,
  })
  const [cardId, setCardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    trackEvent('create_started')
  }, [])

  const charCount = form.message.length
  const cardUrl = cardId
    ? `${process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin}/card/${cardId}`
    : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.senderName.trim() || !form.message.trim()) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: form.senderName,
          recipient_name: form.recipientName || null,
          message: form.message,
          photo_url: form.photoUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')

      markAsCreator(data.id)
      await trackEvent('create_completed', data.id)
      setCardId(data.id)
      setStep('share')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    if (!cardUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🎁 Une surprise pour toi !',
          text: `${form.senderName} t'a préparé quelque chose de spécial pour la fête des pères 💛`,
          url: cardUrl,
        })
      } catch {
        // user cancelled
      }
    } else {
      handleCopy()
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(cardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'share' && cardId) {
    return <ShareStep cardUrl={cardUrl} form={form} onShare={handleShare} onCopy={handleCopy} copied={copied} />
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            ←
          </Link>
          <h1 className="text-xl font-bold text-white">Crée la surprise 🎁</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Sender name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Ton prénom <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex : Léa"
              value={form.senderName}
              onChange={(e) => setForm({ ...form, senderName: e.target.value })}
              required
              maxLength={50}
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none ring-1 ring-zinc-700 transition focus:ring-amber-500"
            />
          </div>

          {/* Recipient name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Le prénom de ton papa
              <span className="ml-1 text-xs text-zinc-500">(optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="Ex : Marc"
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              maxLength={50}
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none ring-1 ring-zinc-700 transition focus:ring-amber-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-zinc-300">
              <span>Ton message <span className="text-amber-400">*</span></span>
              <span className={`text-xs ${charCount > 260 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {charCount}/280
              </span>
            </label>
            <textarea
              placeholder="Papa, je t'écris ce message pour te dire que…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              maxLength={280}
              rows={5}
              className="w-full resize-none rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none ring-1 ring-zinc-700 transition focus:ring-amber-500"
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Une photo ensemble
              <span className="ml-1 text-xs text-zinc-500">(optionnel)</span>
            </label>
            <PhotoUpload
              photoUrl={form.photoUrl}
              onUpload={(url) => setForm({ ...form, photoUrl: url })}
              onClear={() => setForm({ ...form, photoUrl: null })}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !form.senderName.trim() || !form.message.trim()}
            className="mt-2 w-full rounded-full bg-amber-400 py-4 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                Création…
              </span>
            ) : (
              'Générer le lien magique ✨'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}

function ShareStep({
  cardUrl,
  form,
  onShare,
  onCopy,
  copied,
}: {
  cardUrl: string
  form: FormData
  onShare: () => void
  onCopy: () => void
  copied: boolean
}) {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="w-full max-w-sm">
        <div className="text-6xl mb-4 animate-float">🎉</div>
        <h2 className="text-2xl font-bold text-white">
          {form.recipientName ? `La surprise de ${form.recipientName} est prête !` : 'La surprise est prête !'}
        </h2>
        <p className="mt-2 text-zinc-400 text-sm">
          Envoie ce lien à ton papa. Il ne sait pas ce qui l&apos;attend.
        </p>

        {/* URL display */}
        <div className="mt-6 rounded-2xl bg-zinc-800 p-4">
          <p className="break-all text-sm text-zinc-300 font-mono">{cardUrl}</p>
        </div>

        {/* Share buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onCopy}
            className="flex-1 rounded-full border border-zinc-700 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white active:scale-95"
          >
            {copied ? '✓ Copié !' : 'Copier le lien'}
          </button>
          <button
            onClick={onShare}
            className="flex-1 rounded-full bg-amber-400 py-3 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 active:scale-95"
          >
            Partager 🚀
          </button>
        </div>

        {/* Preview link */}
        <a
          href={cardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-300 transition-colors"
        >
          Voir un aperçu →
        </a>

        {/* Watermark note */}
        <p className="mt-12 text-xs text-zinc-700">
          Fait avec DadDrop · gratuit
        </p>
      </div>
    </main>
  )
}
