-- Migration: 20261101000001_initial_schema.sql
-- Description: Core relational schema for Mithun & Kabita Wedding Website
-- Authoritative Model: 14 relational entities as specified in docs/ARCHITECTURE_AND_SECURITY.md

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PRIVATE HELPER SCHEMA (Not exposed to PostgREST Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, anon;

-- 3. CORE TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 4. ENTITY 1: PROFILES (Tied to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile_number TEXT NULL,
  avatar_url TEXT NULL,
  is_approved_guest BOOLEAN NOT NULL DEFAULT FALSE,
  family_group_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. ENTITY 2: FAMILY GROUPS
CREATE TABLE IF NOT EXISTS public.family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  notes TEXT NULL,
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_family_groups_set_updated_at
  BEFORE UPDATE ON public.family_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Resolve circular foreign key from profiles -> family_groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_profiles_family_group'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT fk_profiles_family_group
      FOREIGN KEY (family_group_id) REFERENCES public.family_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. ENTITY 3: FAMILY MANAGERS (Single active manager per family constraint)
CREATE TABLE IF NOT EXISTS public.family_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_family_manager
  ON public.family_managers (family_group_id)
  WHERE is_active = TRUE;

-- 7. ENTITY 4: ACCESS REQUESTS (Guest approval workflow)
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_family_name TEXT NOT NULL,
  relationship_to_couple TEXT NOT NULL,
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT NULL,
  reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rejection_reason CHECK (status != 'rejected' OR rejection_reason IS NOT NULL)
);

CREATE TRIGGER trg_access_requests_set_updated_at
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 8. ENTITY 5: EVENTS (Four confirmed wedding ceremonies)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  traditional_title TEXT NULL,
  tagline TEXT NULL,
  ceremony_date DATE NOT NULL,
  start_time_ist TIME NOT NULL,
  start_instant TIMESTAMPTZ NOT NULL,
  end_instant TIMESTAMPTZ NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  google_maps_url TEXT NOT NULL,
  rsvp_deadline_utc TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 9. ENTITY 6: RSVPS (Ceremony-specific family responses)
CREATE TABLE IF NOT EXISTS public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  family_group_id UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending', 'not_sure')),
  arrival_details TEXT NULL,
  special_dietary_requests TEXT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_event_family_rsvp UNIQUE (event_id, family_group_id)
);

CREATE TRIGGER trg_rsvps_set_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Strict deadline enforcement trigger for RSVPs
CREATE OR REPLACE FUNCTION public.check_rsvp_deadline()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deadline TIMESTAMPTZ;
BEGIN
  SELECT rsvp_deadline_utc INTO v_deadline
  FROM public.events
  WHERE id = NEW.event_id;

  IF v_deadline IS NOT NULL AND NOW() >= v_deadline THEN
    RAISE EXCEPTION 'RSVP deadline for this ceremony has permanently passed.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rsvps_check_deadline
  BEFORE INSERT OR UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.check_rsvp_deadline();

-- 10. ENTITY 7: ATTENDEES (Individual guests for attending RSVPs)
CREATE TABLE IF NOT EXISTS public.attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age_category TEXT NOT NULL DEFAULT 'adult' CHECK (age_category IN ('adult', 'child', 'infant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_attendees_set_updated_at
  BEFORE UPDATE ON public.attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 11. ENTITY 8: WISHES (Public guestbook messages with moderation lifecycle)
CREATE TABLE IF NOT EXISTS public.wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_display_name TEXT NOT NULL,
  wish_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_wishes_set_updated_at
  BEFORE UPDATE ON public.wishes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Trigger: Editing wish text resets status to pending moderation
CREATE OR REPLACE FUNCTION public.handle_wish_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (OLD.wish_text IS DISTINCT FROM NEW.wish_text) THEN
    -- If author is updating, reset to pending
    NEW.status = 'pending';
    NEW.moderated_by = NULL;
    NEW.moderated_at = NULL;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_wishes_handle_update
  BEFORE UPDATE ON public.wishes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wish_update();

-- 12. ENTITY 9: CONVERSATIONS (1-to-1 private guest inquiry thread)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 13. ENTITY 10: CONVERSATION MESSAGES
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  message_body TEXT NOT NULL,
  is_from_admin BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ENTITY 11: MEDIA ITEMS (Wedding photos and YouTube videos)
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  storage_path TEXT NULL,
  youtube_url TEXT NULL,
  category TEXT NOT NULL DEFAULT 'wedding' CHECK (category IN ('haldi', 'mehndi', 'wedding', 'reception', 'portraits')),
  caption TEXT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  download_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_media_items_set_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 15. ENTITY 12: INVITATION SETTINGS
CREATE TABLE IF NOT EXISTS public.invitation_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  headline_text TEXT NOT NULL,
  intro_text TEXT NOT NULL,
  qr_code_target_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_invitation_settings_set_updated_at
  BEFORE UPDATE ON public.invitation_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 16. ENTITY 13: ADMINISTRATOR ROLES & GRANULAR PERMISSIONS
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_admin_users_set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  permission_group TEXT NOT NULL CHECK (
    permission_group IN (
      'guest_rsvp',
      'photos',
      'wishes',
      'questions',
      'events_website',
      'invitation_studio'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_admin_permission UNIQUE (admin_id, permission_group)
);

-- 17. ENTITY 14: ADMINISTRATIVE NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_group TEXT NOT NULL CHECK (
    permission_group IN (
      'guest_rsvp',
      'photos',
      'wishes',
      'questions',
      'events_website',
      'invitation_studio'
    )
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. SAFE AUTH.USERS SYNC TRIGGER (Idempotent profile creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_approved_guest)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest'),
    NEW.email,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE
        WHEN public.profiles.full_name = 'Guest' AND EXCLUDED.full_name != 'Guest'
        THEN EXCLUDED.full_name
        ELSE public.profiles.full_name
      END;
  RETURN NEW;
END;
$$;

-- Note: In a live Supabase environment, the auth trigger attaches to auth.users:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 19. ONE-TIME SECURE SUPER ADMIN BOOTSTRAP PROCEDURE
-- Strictly guarded: Can only be executed once when zero super admins exist.
CREATE OR REPLACE FUNCTION private.bootstrap_super_admin(target_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.admin_users
  WHERE is_super_admin = TRUE;

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Super Admin already bootstrapped. Privilege cannot be re-bootstrapped.';
  END IF;

  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = LOWER(TRIM(target_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user profile not found for email: %', target_email;
  END IF;

  INSERT INTO public.admin_users (id, is_super_admin, is_active)
  VALUES (v_user_id, TRUE, TRUE)
  ON CONFLICT (id) DO UPDATE
  SET is_super_admin = TRUE, is_active = TRUE;
END;
$$;
