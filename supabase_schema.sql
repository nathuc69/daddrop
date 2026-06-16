-- DadDrop MVP schema
-- Run this in the Supabase SQL editor

CREATE TABLE cards (
  id             TEXT PRIMARY KEY,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  sender_name    TEXT NOT NULL,
  recipient_name TEXT,
  message        TEXT NOT NULL CHECK (char_length(message) <= 280),
  photo_url      TEXT,
  theme          TEXT NOT NULL DEFAULT 'fete_des_peres'
);

CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     TEXT REFERENCES cards(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  session_id  TEXT NOT NULL,
  source      TEXT
);

-- Index for quick card lookup
CREATE INDEX events_card_id_idx ON events(card_id);
CREATE INDEX events_type_idx ON events(type);

-- Storage bucket for card photos
INSERT INTO storage.buckets (id, name, public) VALUES ('card-photos', 'card-photos', true);

-- Storage RLS policies
CREATE POLICY "service role can upload" ON storage.objects FOR INSERT TO service_role WITH CHECK (bucket_id = 'card-photos');
CREATE POLICY "public can read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'card-photos');

-- RLS: allow anonymous inserts (MVP has no auth)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow anon insert cards" ON cards FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow anon select cards" ON cards FOR SELECT TO anon USING (true);

CREATE POLICY "allow anon insert events" ON events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow anon select events" ON events FOR SELECT TO anon USING (true);
