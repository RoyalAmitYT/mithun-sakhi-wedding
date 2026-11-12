-- ==============================================================================
-- Migration: 20261101000006_wishes_and_conversations.sql
-- Phase: P-10 — Guest Wishes & Private Conversations
-- Description:
--   1. Enforces text length constraints on wishes and conversation messages.
--   2. Author display name isolation (first name only on submission; 'Guest' on account deletion).
--   3. Memories Mode Cutoff (2026-11-22 18:30:00 UTC / 2026-11-23 00:00:00 IST):
--      - Rejects new wish submissions after cutoff.
--      - Rejects new guest inquiries after cutoff.
--      - Allows authors to edit/delete existing wishes after cutoff.
--      - Allows admins to moderate and reply after cutoff.
--   4. Hardens wish editing: author edits always reset status to 'pending' and clear moderation.
--   5. Account deletion lifecycle: approved wishes stay published under 'Guest'; non-approved
--      wishes and private conversations are purged.
--   6. Public read isolation: column-level grants restrict anon strictly to public columns;
--      exposes public.get_approved_wishes() RPC and public.approved_wishes view returning strictly
--      (id, author_display_name, wish_text, created_at).
--   7. Private conversation thread protection, impersonation guard, and auto-reopening.
--   8. Administrative RPCs for wish moderation and conversation status management.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONSTRAINTS ON WISHES AND MESSAGES
-- ------------------------------------------------------------------------------
ALTER TABLE public.wishes DROP CONSTRAINT IF EXISTS chk_wish_text_length;
ALTER TABLE public.wishes ADD CONSTRAINT chk_wish_text_length
  CHECK (char_length(trim(wish_text)) >= 3 AND char_length(wish_text) <= 1000);

ALTER TABLE public.conversation_messages DROP CONSTRAINT IF EXISTS chk_message_body_length;
ALTER TABLE public.conversation_messages ADD CONSTRAINT chk_message_body_length
  CHECK (char_length(trim(message_body)) >= 1 AND char_length(message_body) <= 2000);

-- ------------------------------------------------------------------------------
-- 2. WISH SUBMISSION CUTOFF & AUTHOR FIRST NAME ISOLATION TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_wish_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_first_name TEXT;
BEGIN
  -- When invoked in an authenticated client session, enforce guest rules
  IF auth.role() = 'authenticated' THEN
    -- 1. Cutoff check: new wishes blocked past Memories Mode cutoff (2026-11-22 18:30:00+00)
    IF COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW()) >= '2026-11-22 18:30:00+00'::timestamptz THEN
      RAISE EXCEPTION 'Wedding celebration cutoff has passed. New wishes can no longer be submitted.';
    END IF;

    -- 2. Derive author display name strictly from profile's first name
    SELECT NULLIF(SPLIT_PART(TRIM(full_name), ' ', 1), '') INTO v_first_name
    FROM public.profiles
    WHERE id = NEW.profile_id;

    NEW.author_display_name := COALESCE(v_first_name, 'Guest');

    -- 3. Initial state is always pending
    NEW.status := 'pending';
    NEW.moderated_by := NULL;
    NEW.moderated_at := NULL;
  END IF;

  NEW.created_at := COALESCE(NEW.created_at, NOW());
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wishes_handle_submission ON public.wishes;
CREATE TRIGGER trg_wishes_handle_submission
  BEFORE INSERT ON public.wishes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wish_submission();

-- ------------------------------------------------------------------------------
-- 3. HARDENED WISH UPDATE TRIGGER (RESET TO PENDING ON AUTHOR EDIT)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_wish_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_moderator BOOLEAN;
BEGIN
  IF current_user IN ('postgres', 'supabase_admin') THEN
    v_is_moderator := TRUE;
  ELSIF auth.role() = 'authenticated' THEN
    v_is_moderator := (auth.uid() IS NOT NULL AND (
      private.is_super_admin(auth.uid()) OR private.has_admin_permission('wishes', auth.uid())
    ));
  ELSE
    v_is_moderator := FALSE;
  END IF;

  -- If wish_text has been modified, it ALWAYS resets to pending moderation
  IF (OLD.wish_text IS DISTINCT FROM NEW.wish_text) THEN
    NEW.status := 'pending';
    NEW.moderated_by := NULL;
    NEW.moderated_at := NULL;
  END IF;

  -- If regular authenticated user (author) updates, prevent tampering with moderation or identity fields
  IF NOT v_is_moderator THEN
    NEW.profile_id := OLD.profile_id;
    NEW.author_display_name := OLD.author_display_name;
    IF (OLD.wish_text IS NOT DISTINCT FROM NEW.wish_text) THEN
      NEW.status := OLD.status;
      NEW.moderated_by := OLD.moderated_by;
      NEW.moderated_at := OLD.moderated_at;
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wishes_handle_update ON public.wishes;
CREATE TRIGGER trg_wishes_handle_update
  BEFORE UPDATE ON public.wishes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_wish_update();

-- ------------------------------------------------------------------------------
-- 4. ACCOUNT DELETION LIFECYCLE FOR WISHES & CONVERSATIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_profile_deletion_wishes_and_conversations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- A. Approved wishes: preserve published status under anonymous display name 'Guest'
  UPDATE public.wishes
  SET author_display_name = 'Guest',
      profile_id = NULL
  WHERE profile_id = OLD.id AND status = 'approved';

  -- B. Non-approved wishes (pending or rejected): delete permanently
  DELETE FROM public.wishes
  WHERE profile_id = OLD.id AND status != 'approved';

  -- C. Private conversations and messages: delete to avoid orphaned data
  DELETE FROM public.conversations
  WHERE profile_id = OLD.id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_handle_deletion ON public.profiles;
CREATE TRIGGER trg_profiles_handle_deletion
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_deletion_wishes_and_conversations();

-- ------------------------------------------------------------------------------
-- 5. PUBLIC ISOLATION & SAFE VIEWS/RPCS FOR APPROVED WISHES
-- ------------------------------------------------------------------------------
-- Restrict anon table privileges strictly to public approved columns
REVOKE ALL ON public.wishes FROM anon;
GRANT SELECT (id, author_display_name, wish_text, created_at) ON public.wishes TO anon;

DROP POLICY IF EXISTS "wishes_select_anon" ON public.wishes;
CREATE POLICY "wishes_select_anon" ON public.wishes
  FOR SELECT TO anon
  USING (status = 'approved');

-- Authenticated select: authors view own wishes; wishes admins view all
DROP POLICY IF EXISTS "wishes_select_authenticated" ON public.wishes;
CREATE POLICY "wishes_select_authenticated" ON public.wishes
  FOR SELECT TO authenticated
  USING (
    (auth.uid() IS NOT NULL AND profile_id = auth.uid())
    OR private.has_admin_permission('wishes', auth.uid())
  );

-- Safe RPC returning only approved wishes and public fields
CREATE OR REPLACE FUNCTION public.get_approved_wishes()
RETURNS TABLE (
  id UUID,
  author_display_name TEXT,
  wish_text TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, author_display_name, wish_text, created_at
  FROM public.wishes
  WHERE status = 'approved'
  ORDER BY created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_approved_wishes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_approved_wishes() TO anon, authenticated;

-- Safe View for public consumption
CREATE OR REPLACE VIEW public.approved_wishes WITH (security_invoker = false) AS
SELECT id, author_display_name, wish_text, created_at
FROM public.wishes
WHERE status = 'approved';

GRANT SELECT ON public.approved_wishes TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 6. PRIVATE CONVERSATION PROTECTION & MESSAGES TRIGGER
-- ------------------------------------------------------------------------------
-- Restrict direct conversation status update to admins only
DROP POLICY IF EXISTS "conversations_update_own_or_admin" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_admin" ON public.conversations;
CREATE POLICY "conversations_update_admin" ON public.conversations
  FOR UPDATE TO authenticated
  USING (
    private.has_admin_permission('questions', auth.uid())
    OR private.is_super_admin(auth.uid())
  )
  WITH CHECK (
    private.has_admin_permission('questions', auth.uid())
    OR private.is_super_admin(auth.uid())
  );

-- Trigger: handles message insertion, impersonation guard, cutoff, and status flow
CREATE OR REPLACE FUNCTION public.handle_conversation_message_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_conv_profile_id UUID;
  v_conv_status TEXT;
BEGIN
  SELECT profile_id, status INTO v_conv_profile_id, v_conv_status
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  IF v_conv_profile_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found.';
  END IF;

  v_is_admin := (auth.uid() IS NOT NULL AND (
    private.is_super_admin(auth.uid()) OR private.has_admin_permission('questions', auth.uid())
  ));

  -- 1. Impersonation guard
  IF NEW.is_from_admin AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only wedding administrators can send official replies.';
  END IF;

  -- 2. Sender validation
  IF v_is_admin THEN
    NEW.is_from_admin := TRUE;
  ELSE
    NEW.is_from_admin := FALSE;
    -- Regular guest can only send in their own conversation
    IF v_conv_profile_id != auth.uid() THEN
      RAISE EXCEPTION 'Unauthorized: Cannot send messages in another guest''s conversation.';
    END IF;

    -- 3. Cutoff guard for guests (2026-11-22 18:30:00 UTC)
    IF COALESCE(NULLIF(current_setting('app.test_time_override', true), '')::timestamptz, NOW()) >= '2026-11-22 18:30:00+00'::timestamptz THEN
      RAISE EXCEPTION 'Wedding celebration cutoff has passed. New guest questions can no longer be submitted.';
    END IF;
  END IF;

  -- 4. Update conversation status and updated_at
  IF v_is_admin THEN
    -- If admin replies to a 'new' conversation, shift to 'in_progress'
    IF v_conv_status = 'new' THEN
      UPDATE public.conversations
      SET status = 'in_progress', updated_at = NOW()
      WHERE id = NEW.conversation_id;
    ELSE
      UPDATE public.conversations
      SET updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
  ELSE
    -- If guest sends a message to a 'resolved' conversation, reopen as 'new'
    IF v_conv_status = 'resolved' THEN
      UPDATE public.conversations
      SET status = 'new', updated_at = NOW()
      WHERE id = NEW.conversation_id;
    ELSE
      UPDATE public.conversations
      SET updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conversation_messages_insert ON public.conversation_messages;
CREATE TRIGGER trg_conversation_messages_insert
  BEFORE INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_conversation_message_insert();

-- ------------------------------------------------------------------------------
-- 7. ADMINISTRATIVE RPCS: WISH MODERATION & CONVERSATION STATUS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_moderate_wish(
  p_wish_id UUID,
  p_decision TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('wishes', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Requires wishes permission.' USING ERRCODE = '42501';
  END IF;

  IF p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid decision: %. Allowed values are approved or rejected.', p_decision;
  END IF;

  UPDATE public.wishes
  SET status = p_decision,
      moderated_by = v_caller_id,
      moderated_at = NOW(),
      updated_at = NOW()
  WHERE id = p_wish_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wish not found.';
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'wish_id', p_wish_id,
    'status', p_decision
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_moderate_wish(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_wish(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_conversation_status(
  p_conversation_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '28000';
  END IF;

  IF NOT (private.is_super_admin(v_caller_id) OR private.has_admin_permission('questions', v_caller_id)) THEN
    RAISE EXCEPTION 'Unauthorized: Requires questions permission.' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('new', 'in_progress', 'resolved') THEN
    RAISE EXCEPTION 'Invalid status: %. Allowed values are new, in_progress, or resolved.', p_status;
  END IF;

  UPDATE public.conversations
  SET status = p_status,
      updated_at = NOW()
  WHERE id = p_conversation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found.';
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'conversation_id', p_conversation_id,
    'status', p_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_conversation_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_conversation_status(UUID, TEXT) TO authenticated;
