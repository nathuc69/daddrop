import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl">🤔</div>
      <h1 className="text-2xl font-bold text-white">Ce lien est introuvable</h1>
      <p className="text-zinc-400 text-sm max-w-xs">
        Ce lien a peut-être expiré ou n&apos;existe pas. Vérifie l&apos;URL ou crée ta propre carte !
      </p>
      <Link
        href="/create"
        className="rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-300 transition-colors active:scale-95"
      >
        Crée une surprise →
      </Link>
    </main>
  )
}
