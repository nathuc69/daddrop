'use client'

import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'

type Props = {
  onUpload: (url: string) => void
  onClear: () => void
  photoUrl: string | null
}

export default function PhotoUpload({ onUpload, onClear, photoUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      })

      const form = new FormData()
      form.append('file', compressed, file.name)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Upload échoué')
      onUpload(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setLoading(false)
    }
  }

  if (photoUrl) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden aspect-video">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="Photo choisie" className="w-full h-full object-cover" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 rounded-full bg-zinc-900/80 px-3 py-1 text-xs text-white hover:bg-zinc-700 transition-colors"
        >
          Changer
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full rounded-2xl border-2 border-dashed border-zinc-700 p-8 text-center text-zinc-400 transition-colors hover:border-amber-500/50 hover:text-amber-400 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            Chargement…
          </span>
        ) : (
          <>
            <p className="text-3xl mb-2">📷</p>
            <p className="text-sm font-medium">Ajouter une photo</p>
            <p className="text-xs text-zinc-600 mt-1">optionnel · JPG, PNG, WebP</p>
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
    </div>
  )
}
