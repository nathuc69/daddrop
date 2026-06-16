export type Card = {
  id: string
  created_at: string
  sender_name: string
  recipient_name: string | null
  message: string
  photo_url: string | null
  theme: string
}

export type EventType =
  | 'landing_view'
  | 'create_started'
  | 'create_completed'
  | 'card_opened'
  | 'reveal_completed'
  | 'loop_create_started'

export type Event = {
  id: string
  card_id: string | null
  type: EventType
  created_at: string
  session_id: string
  source: string | null
}
