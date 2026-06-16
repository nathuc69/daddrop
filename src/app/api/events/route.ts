import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const VALID_TYPES = [
  'landing_view',
  'create_started',
  'create_completed',
  'card_opened',
  'reveal_completed',
  'loop_create_started',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, card_id, session_id, source } = body

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const db = createServiceClient()
    const { error } = await db.from('events').insert({
      type,
      card_id: card_id || null,
      session_id,
      source: source || null,
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/events]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
