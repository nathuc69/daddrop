// Vérifie les événements analytics en base.
// Usage : node --env-file=.env.local scripts/check-events.mjs
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const EXPECTED = [
  'landing_view',
  'create_started',
  'create_completed',
  'card_opened',
  'reveal_completed',
  'loop_create_started',
]

const res = await fetch(
  `${URL}/rest/v1/events?select=type,created_at,card_id,source&order=created_at.desc`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
)

if (!res.ok) {
  console.error(`❌ Erreur Supabase (${res.status}) :`, await res.text())
  process.exit(1)
}

const events = await res.json()

const counts = Object.fromEntries(EXPECTED.map((t) => [t, 0]))
for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1

console.log(`\n📊 ${events.length} événements en base\n`)
console.log('Funnel (les 6 events attendus) :')
for (const t of EXPECTED) {
  const n = counts[t]
  console.log(`  ${n > 0 ? '✓' : '·'} ${t.padEnd(22)} ${n}`)
}

const ratio = (a, b) => (b ? `${((a / b) * 100).toFixed(0)}%` : 'n/a')
console.log('\nTaux clés :')
console.log(`  Complétion création : ${ratio(counts.create_completed, counts.landing_view)}  (create_completed / landing_view)`)
console.log(`  Taux de partage     : ${ratio(counts.card_opened, counts.create_completed)}  (card_opened / create_completed) ← LA métrique`)
console.log(`  Taux de boucle      : ${ratio(counts.loop_create_started, counts.card_opened)}  (loop_create_started / card_opened)`)

console.log('\n5 derniers événements :')
for (const e of events.slice(0, 5)) {
  const when = new Date(e.created_at).toLocaleString('fr-FR')
  console.log(`  ${when}  ${e.type.padEnd(22)} ${e.card_id ?? '—'}`)
}
console.log()
