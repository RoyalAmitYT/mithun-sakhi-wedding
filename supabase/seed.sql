-- Supabase Seed Data: Mithun & Sakhi Wedding Website
-- Source of Truth: docs/CONTENT_AND_EVENT_DATA.md
-- Strict Anti-Fabrication: Only confirmed events seeded. Zero fake users, admins, wishes, or media.

-- 1. SEED CONFIRMED WEDDING CEREMONIES
INSERT INTO public.events (
  id,
  slug,
  title,
  traditional_title,
  tagline,
  ceremony_date,
  start_time_ist,
  start_instant,
  end_instant,
  venue_name,
  venue_address,
  google_maps_url,
  rsvp_deadline_utc,
  is_published,
  display_order
)
VALUES
  (
    'haldi',
    'haldi',
    'Haldi',
    'Haldi Ceremony',
    'The Auspicious Turmeric Ceremony',
    '2026-11-19',
    '09:00:00',
    '2026-11-19 09:00:00+05:30',
    NULL,
    'Groom''s Home',
    'Chitmu, Kotshila, Purulia, West Bengal 723215',
    'https://maps.app.goo.gl/Lt8BRMxAEUy371NVA',
    '2026-11-18 18:29:59+00',
    TRUE,
    1
  ),
  (
    'mehndi',
    'mehndi',
    'Mehndi',
    'Mehndi Ceremony',
    'The Joyous Henna Celebration',
    '2026-11-20',
    '09:00:00',
    '2026-11-20 09:00:00+05:30',
    NULL,
    'Groom''s Home',
    'Chitmu, Kotshila, Purulia, West Bengal 723215',
    'https://maps.app.goo.gl/Lt8BRMxAEUy371NVA',
    '2026-11-19 18:29:59+00',
    TRUE,
    2
  ),
  (
    'wedding',
    'wedding',
    'The Sacred Wedding',
    'The Sacred Wedding',
    'The Sacred Union & Vedic Vows',
    '2026-11-21',
    '23:00:00',
    '2026-11-21 23:00:00+05:30',
    NULL,
    'Bride''s Home',
    'Ghaghra, Jaipur, Purulia, West Bengal 723201',
    'https://maps.app.goo.gl/x1zvibZRTMTNTWCn7',
    '2026-11-20 18:29:59+00',
    TRUE,
    3
  ),
  (
    'reception',
    'reception',
    'Reception',
    'Reception',
    'Celebration Banquet & Welcoming Feast',
    '2026-11-22',
    '17:00:00',
    '2026-11-22 17:00:00+05:30',
    NULL,
    'Groom''s Home',
    'Chitmu, Kotshila, Purulia, West Bengal 723215',
    'https://maps.app.goo.gl/Lt8BRMxAEUy371NVA',
    '2026-11-21 18:29:59+00',
    TRUE,
    4
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  traditional_title = EXCLUDED.traditional_title,
  tagline = EXCLUDED.tagline,
  ceremony_date = EXCLUDED.ceremony_date,
  start_time_ist = EXCLUDED.start_time_ist,
  start_instant = EXCLUDED.start_instant,
  end_instant = EXCLUDED.end_instant,
  venue_name = EXCLUDED.venue_name,
  venue_address = EXCLUDED.venue_address,
  google_maps_url = EXCLUDED.google_maps_url,
  rsvp_deadline_utc = EXCLUDED.rsvp_deadline_utc,
  is_published = EXCLUDED.is_published,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- 2. SEED DEFAULT INVITATION SETTINGS
INSERT INTO public.invitation_settings (
  id,
  headline_text,
  intro_text,
  qr_code_target_url,
  is_published
)
VALUES
  (
    'default',
    'WITH THE DIVINE BLESSINGS OF OUR FAMILIES',
    'With joyful hearts, we invite you to celebrate our sacred union' || chr(10) || 'and bless the beautiful beginning of our life together.',
    'https://mithun-sakhi-wedding.vercel.app/#invitation',
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET
  headline_text = EXCLUDED.headline_text,
  intro_text = EXCLUDED.intro_text,
  qr_code_target_url = EXCLUDED.qr_code_target_url,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
