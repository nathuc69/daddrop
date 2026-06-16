import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sender_name, recipient_name, message, photo_url } = body

    if (!sender_name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'sender_name and message are required' },
        { status: 400 }
      )
    }

    if (message.length > 280) {
      return NextResponse.json(
        { error: 'Message must be 280 characters or less' },
        { status: 400 }
      )
    }

    const id = nanoid(7)
    const db = createServiceClient()

    const { error } = await db.from('cards').insert({
      id,
      sender_name: sender_name.trim(),
      recipient_name: recipient_name?.trim() || null,
      message: message.trim(),
      photo_url: photo_url || null,
      theme: 'fete_des_peres',
    })

    if (error) throw error

    return NextResponse.json({ id })
  } catch (err) {
    console.error('[POST /api/cards]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
