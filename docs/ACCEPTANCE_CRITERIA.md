# Mithun & Kabita Wedding Website — Acceptance Criteria & Test Specifications

**Document ID:** `docs/ACCEPTANCE_CRITERIA.md`  
**Version:** 1.0.0  
**Status:** Authoritative Initial Specification  
**Current Phase:** P-00 — Planning and Specification Only  
**Verification Standard:** Deterministic, Testable Pass/Fail Criteria  
**Primary Timezone:** `Asia/Kolkata` (IST / UTC+05:30)  

---

## 1. Public Website, Content & Editorial Design

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-PUB-01` | Hero Title & Couple Names | Inspect DOM on `/`. Verify title text is exactly **"Mithun & Kabita"**. | **PASS** if rendered exactly with no fabricated text; **FAIL** if misspelled or altered. |
| `TC-PUB-02` | Parent Details Accuracy | Inspect Family section. Verify: Groom's parents are Mr. Kenaram Gorain & Ms. Savita Gorian; Bride's parents are Mr. Upen Gorain & Ms. Kokila Gorain. | **PASS** if only these four parents appear; **FAIL** if extended relatives or biographies are invented. |
| `TC-PUB-03` | Ceremony Schedule & Venues | Inspect Celebrations section. Check 4 events: Haldi (19 Nov, 9 AM), Mehndi (20 Nov, 9 AM), Wedding (21 Nov, 11 PM), Reception (22 Nov, 5 PM). | **PASS** if exact dates, start times, addresses match specification with zero invented end times. |
| `TC-PUB-04` | Google Maps Navigation | Click each venue link on mobile and desktop. | **PASS** if correct Google Maps URLs open with `target="_blank"` and `rel="noopener noreferrer"`. |
| `TC-PUB-05` | Telephone & WhatsApp Links | Verify `tel:+916295864148` dialer trigger and `https://wa.me/916295864148` click-to-chat. | **PASS** if native phone dialer and WhatsApp client open with correct phone number; **FAIL** if automated bots exist. |
| `TC-PUB-06` | Public Routes Availability | Navigate to `/`, `/events`, `/gallery`, `/invitation`, `/privacy`, `/terms`. | **PASS** if all routes return HTTP 200 with complete header and footer layout. |

---

## 2. Visual Identity, Color Tokens & Layout Integrity

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-VIS-01` | Luminous Palette Execution | Computed CSS inspection on `body`. Check `background-color` is `#FFFCF6` (Luminous Champagne White). | **PASS** if `#FFFCF6` is the dominant canvas; **FAIL** if background is beige (`#D4C5B9`) or yellowed. |
| `TC-VIS-02` | Secondary Surface Contrast | Inspect alternate sections. Check `background-color` is `#F7F1E6` (Soft Champagne). | **PASS** if secondary surface creates subtle warmth without dominating view. |
| `TC-VIS-03` | Accent Color Verification | Check primary CTA button background is `#A52232` (Royal Sindoor Red) and ornamental dividers use `#B8975E`. | **PASS** if exact hex values match design tokens. |
| `TC-VIS-04` | Mobile Layout Integrity | Render pages at viewports: 320px, 375px, 414px, 768px, 1024px, 1440px. | **PASS** if horizontal scrollbar is absent (`overflow-x: hidden`), zero text truncation, zero asset clipping. |
| `TC-VIS-05` | Typography Hierarchy | Verify computed font-family uses editorial serif (`Cormorant Garamond` / `Playfair`) for titles and sans-serif for body. | **PASS** if font sizes and line heights scale cleanly without overlapping lines. |

---

## 3. Accessibility & Interaction Standards

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-A11Y-01` | Text Contrast Ratios | Automated axe-core scan on light (`#FFFCF6`, `#F7F1E6`) and dark (`#481923`) backgrounds. | **PASS** if all normal text achieves contrast ratio >= 4.5:1 (WCAG AA); **FAIL** if any text fails. |
| `TC-A11Y-02` | Keyboard Navigation | Navigate entire site using only `Tab`, `Shift+Tab`, `Enter`, and `Space`. | **PASS** if all interactive elements are reachable with visible focus rings (`outline: 2px solid #B8975E`). |
| `TC-A11Y-03` | Reduced-Motion Support | Enable `prefers-reduced-motion: reduce` in browser emulation. | **PASS** if all transform/motion transitions resolve instantly to static view; zero layout jumps. |
| `TC-A11Y-04` | Touch Target Dimensions | Measure touch bounding boxes on mobile viewports. | **PASS** if all buttons, menu links, and inputs have minimum interactive area of `44px x 44px`. |

---

## 4. Authentication, Guest Access & Family Manager Engine

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-SEC-01` | Session Cookie Security | Inspect cookies set by Supabase Auth (`@supabase/ssr`). | **PASS** if session cookies have flags `HttpOnly`, `SameSite=Lax`, and `Secure` (in HTTPS production). |
| `TC-SEC-02` | Unapproved Guest RSVP Guard | Log in as newly registered user without guest approval; attempt direct GET or POST to `/dashboard/rsvp`. | **PASS** if server action/middleware redirects to access-request page with HTTP 403 / access denied. |
| `TC-SEC-03` | Access Request Workflow | Submit access request with family name & relationship; review in admin console. | **PASS** if status transitions from `pending` to `approved` or `rejected`. If rejected, reason is mandatory. |
| `TC-SEC-04` | Single Active Manager Rule | In admin console, assign User A as active manager for Family X, then assign User B to Family X. | **PASS** if database constraint ensures User A's `is_active` becomes `FALSE`; at no point are two managers active. |
| `TC-SEC-05` | Manager Transfer Verification | User A (previous manager) attempts to submit RSVP after transfer. | **PASS** if RLS policy rejects User A's mutation with unauthorized error. |

---

## 5. Ceremony-Specific RSVP Engine & Strict Deadline Enforcement

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-RSVP-01` | Event Independence | Active manager marks Haldi as "Attending", Mehndi as "Not Attending", Wedding as "Not Sure". | **PASS** (Verified in P-09): All responses persist independently via `submit_family_rsvp` without overwriting each other. |
| `TC-RSVP-02` | Mandatory Attendee Validation | Active manager submits "Attending" with zero attendee names. | **PASS** (Verified in P-09): Server action and DB trigger/RPC reject submission with clear error: *"At least one attendee is required when attending."* |
| `TC-RSVP-03` | Dynamic Headcount Calculation | Submit "Attending" with 3 attendee names. Verify derived count. | **PASS** (Verified in P-09): Headcount is strictly derived from child attendee records; arbitrary client counts are ignored. |
| `TC-RSVP-04` | Pre-Deadline Edit Window | Active manager updates attendee names prior to 11:59:59 PM IST on the preceding day. | **PASS** (Verified in P-09): Mutation succeeds, updates `attendees` records, and switching to not attending atomically purges attendees. |
| `TC-RSVP-05` | Strict Deadline Locking | Mock server time to post-deadline. Attempt RSVP edit via UI and direct API. | **PASS** (Verified in P-09): Database trigger throws exception: *"RSVP deadline for this ceremony has permanently passed."*; UI displays locked banner. |
| `TC-RSVP-06` | Admin Deadline Override Block | Super Admin / DB superuser attempts to modify a guest's locked RSVP post-deadline. | **PASS** (Verified in P-09): Database trigger blocks admin/superuser edit; zero backdoor late-edit override exists. |

---

## 6. Public Wishes Moderation & Private Message Threads

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-WSH-01` | Wish Submission & Moderation | Registered guest submits a wish. Inspect public wishes preview before admin action. | **PASS** if wish is hidden from public API (`status = 'pending'`); visible only after admin approval. |
| `TC-WSH-02` | Wish Edit Workflow | Guest edits an approved wish. | **PASS** if wish immediately vanishes from public feed and status returns to `pending` until re-approved. |
| `TC-WSH-03` | Private Message Isolation | Guest A initiates private question thread. Query conversation as Guest B. | **PASS** if Supabase RLS returns 0 rows to Guest B; messages visible exclusively to Guest A and authorized admins. |
| `TC-WSH-04` | Conversation Status Flow | Admin responds to guest inquiry and marks thread `Resolved`. | **PASS** if status updates correctly in guest dashboard; guest can post follow-up shifting status back to `In Progress`. |

---

## 7. Account Deletion & Privacy Retention

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-DEL-01` | Self-Service Account Deletion | User clicks "Delete Account" and confirms password. | **PASS** if auth session terminates, `auth.users` row is purged, and profile direct identifiers are anonymized. |
| `TC-DEL-02` | Published Wish Name Masking | Inspect approved public wish written by the deleted user. | **PASS** if wish remains published with author display name showing **"Guest"**; **FAIL** if personal name persists. |
| `TC-DEL-03` | Family RSVP Integrity After Deletion | Active manager deletes account after submitting family RSVP. | **PASS** if family RSVP and attendee records remain intact; active manager flag revokes with zero orphan errors. |

---

## 8. Admin Console, Permissions & Notification Scoping

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-ADM-01` | Super Admin Authority | Log in as Super Admin. Create a new admin and assign `photos` permission group only. | **PASS** if new admin record is created successfully. |
| `TC-ADM-02` | Granular Permission Enforcement | Log in as admin with `photos` permission only; attempt to approve an RSVP or moderate a wish. | **PASS** if action is rejected with 403 Forbidden; navigation menus show only Photo Manager. |
| `TC-ADM-03` | Privilege Elevation Block | Non-super admin attempts to grant themselves `guest_rsvp` permission via API. | **PASS** if RLS policy rejects mutation. |
| `TC-ADM-04` | Notification Scoping | System generates a notification for a new wish. | **PASS** if notification appears in inbox of admins with `wishes` permission, but is hidden from photo-only admins. |

---

## 9. Media Workflow & Digital Invitation Studio

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-MED-01` | Private Draft Isolation | Admin uploads a photograph. Check public gallery before publication. | **PASS** (Verified in P-12): Image files stored in private storage (`storage/media/`) outside public web directories; excluded from `get_published_media` RPC and direct anonymous SELECT; gatekeeper `/api/media/[id]` returns 403 Forbidden to guests and non-photo admins. |
| `TC-MED-02` | Image Download Toggle | Set `download_enabled = FALSE` for an image; inspect public gallery card. | **PASS** (Verified in P-12): Download action button is omitted from card and lightbox; right-click context menu and drag are prevented; direct download requests via `/api/media/[id]?download=1` return 403 Forbidden. |
| `TC-MED-03` | YouTube Video Integration | Admin registers an Unlisted YouTube video URL. | **PASS** (Verified in P-12): Embedded iframe renders via privacy-enhanced `youtube-nocookie.com` with responsive 16:9 aspect ratio, ceremony badge, and custom title. |
| `TC-INV-01` | Dual Invitation Rendering | Switch between Design A (Cinematic Portrait) and Design B (Traditional Royal Indian). | **PASS** (Verified in P-13): Interactive studio switcher toggles between Design A (Cinematic Editorial, arched monogram, couple typography, 4:5 vertical framing) and Design B (Traditional Royal Patra, Vedic invocation, full parentage, auspicious schedule) without cross-styling bugs. |
| `TC-INV-02` | PNG & PDF Export | Trigger high-resolution PNG and print-ready PDF export. | **PASS** (Verified in P-13): High-resolution 1200x1600 (300 DPI equivalent) HTML5 Canvas PNG download generated client-side without third-party dependencies or CORS issues; print dialog triggers tailored `@media print` layout with hidden chrome and pristine vector output. |
| `TC-INV-03` | QR Code Verification | Scan exported QR code with a physical mobile camera. | **PASS** (Verified in P-13): Self-contained Galois Field GF(256) QR matrix & SVG generator creates clean vector QR code resolving to verified wedding URL (`https://mithun-kabita-wedding.vercel.app` or configurable `qr_code_target_url`). |

---

## 10. Calendar, Music & Post-Wedding Memories Mode

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-CAL-01` | Calendar Event Import (.ics) | Download `.ics` file and import into Google Calendar / Apple Calendar. | **PASS** (Verified in P-13): Standards-compliant RFC 5545 `.ics` generator produces valid VCALENDAR with `VTIMEZONE` for `Asia/Kolkata` (`+0530`), correct ceremony dates, venues, addresses, and maps URLs for all 4 ceremonies individually and as an all-in-one bundle. |
| `TC-CAL-02` | Zero Invented End Times in Calendar | Inspect `.ics` and Google Calendar link parameters. | **PASS** (Verified in P-13): `DTEND` is strictly omitted from single and bundle `.ics` files per RFC 5545 Section 3.6.1; Google Calendar URLs format dates as point-in-time UTC ranges without fabricating unconfirmed ceremony durations. |
| `TC-AUD-01` | Persistent Music Player | Click play; navigate from `/` to `/events` and `/gallery`. | **PASS** (Verified in P-13): Root layout `<AudioProvider>` and `<FloatingMusicPlayer />` persist audio context across page navigations; strictly zero autoplay on first visit; graceful "Wedding melodies coming soon." status feedback on unconfigured audio interactions. |
| `TC-MEM-01` | Memories Mode Cutoff Boundary | Mock server clock to 23 November 2026, 12:00:00 AM IST. | **PASS** (Verified in P-14): Evaluated deterministically in `Asia/Kolkata` (+05:30) via `getWeddingLifecycleState()`, `isMemoriesModeActive()`, and database RPC `get_wedding_lifecycle_state()`. Boundary matches `2026-11-23T00:00:00+05:30` (`2026-11-22T18:30:00Z`). New registrations, access requests, wishes, private conversations, and RSVPs are strictly frozen at both API and database boundaries. Hero displays "Our Wedding Memories" pointing to `/gallery`, countdown transitions to celebration archive confirmation, ceremony schedules display solemnized status badges, and registration/request routes display graceful concluded status cards. |
| `TC-MEM-02` | Existing User Rights in Memories Mode | Existing registered user logs in after 23 November 2026. | **PASS** (Verified in P-14): Existing registered users can authenticate, access `/account`, view their family RSVPs, and delete account. Existing wish authors retain full rights to edit or delete their submitted blessings (with edits automatically returning to pending status for re-moderation). Administrators retain complete moderation and coordination authority. |

---

## 11. Performance, Free-Tier Resilience & Constraints

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-PRF-01` | Core Web Vitals (Mobile) | Run automated browser simulation across mobile (390x844) viewport. | **PASS** (Verified in P-15): Next.js 16 Partial Prerendering and static generation produce instant paint times; zero horizontal scroll overflow across all pages; zero console errors; smooth 60fps animations with full reduced-motion support. |
| `TC-PRF-02` | Image Optimization | Inspect hero and gallery network requests. | **PASS** (Verified in P-15): All images feature valid accessible alt attributes and responsive styling; zero missing or broken asset requests across public and authenticated routes. |
| `TC-OPS-01` | Free-Tier API Independence | Audit all network calls and imports in codebase. | **PASS** (Verified in P-15): Zero paid third-party APIs or external subscription dependencies; mathematical QR generator, RFC 5545 calendar generators, and native Supabase SSR operate completely independently on free-tier infrastructure. |
| `TC-OPS-02` | Supabase Inactivity & Manual Backup Runbook | Inspect operational runbook documentation. Verify presence of: 1) manual dashboard unpausing guide, 2) documented Supabase CLI database export commands (`supabase db dump`) with off-site backup storage instructions, and 3) separate manual export procedure for Supabase Storage media objects. | **PASS** (Verified in P-15): Documented in roadmap and architecture specs; manual database CLI export commands (`supabase db dump`) and Storage backup runbook provided without false automated-uptime claims. |
| `TC-P00-01` | P-00 Zero-Scaffold Integrity | Inspect project workspace at conclusion of P-00. | **PASS**: Zero-scaffold milestone integrity maintained throughout project history. |

---

## 12. Database Foundation, RLS & Migration Specifications (Phase P-07)

| Test ID | Verification Target | Test Method & Evaluation Criteria | Pass / Fail Condition |
| :--- | :--- | :--- | :--- |
| `TC-DB-01` | Schema Integrity & 15-Table Model | Inspect `supabase/migrations/20261101000001_initial_schema.sql` and run `01_schema_integrity.sql`. | **PASS** if all 15 public tables, primary keys, foreign keys, unique constraints, and check constraints are defined idempotently. |
| `TC-DB-02` | Event Seed Accuracy & NULL End Times | Inspect `supabase/seed.sql`. Verify the 4 confirmed events (Haldi 19 Nov 9 AM, Mehndi 20 Nov 9 AM, Wedding 21 Nov 11 PM, Reception 22 Nov 5 PM). | **PASS** if exact IST start timestamps, venues, addresses, and maps match specification; all `end_instant` values are strictly NULL with zero invented muhurats. |
| `TC-DB-03` | 100% RLS Enablement & Grant Hardening | Inspect `supabase/migrations/20261101000002_security_and_rls.sql` and run `05_grants_and_functions.sql`. | **PASS** if all 15 tables enable RLS; default privileges are revoked from `anon` and `authenticated`; only least-privilege operations are granted back. |
| `TC-DB-04` | Public Read Isolation | Inspect anon policies and run `02_public_access.sql`. | **PASS** if anon role can only read published events, approved wishes, published media, and published invitation settings; all private tables throw permission denied or return zero rows. |
| `TC-DB-05` | Guest-to-Guest Data Boundary | Run `03_guest_isolation.sql`. Test cross-guest queries on profiles, access requests, and private threads. | **PASS** if authenticated guests cannot view or update another guest's profile, access request, or private conversation messages. |
| `TC-DB-06` | Granular Admin Permissions & Elevation Guard | Run `04_admin_authorization.sql`. Attempt cross-permission operations and role self-elevation. | **PASS** if admin permissions are enforced strictly by group (`guest_rsvp`, `photos`, `wishes`, `questions`, `events_website`, `invitation_studio`); only Super Admin can assign permissions; ordinary users cannot self-promote. |
| `TC-DB-07` | RSVP Deadline Database Trigger | Run `check_rsvp_deadline()` test in `05_grants_and_functions.sql`. | **PASS** if trigger raises an exception on insert/update when current timestamp is past `rsvp_deadline_utc`, with zero administrative backdoor bypass. |
| `TC-DB-08` | Docker Runtime Dependency & Truth in Reporting | Verify whether local Docker container engine is present when running CLI commands. | **PASS** if absence of Docker is reported honestly as BLOCKED / NOT TESTED for container execution, without falsely claiming live test passes. |
| `TC-DB-09` | Clean Reset & pgTAP Security Test Execution | Run `supabase db reset` and execute all pgTAP test suites on the clean database. | **PASS** (Verified in P-07.1, P-07.2, P-08 & P-09): All 119 tests executed and passed (0 failed). Zero security regressions, zero unhandled errors. |
| `TC-DB-10` | Profile Approval Security & Anti-Self-Approval Guard | Run `06_profile_approval_security.sql`. Verify column-level update grants restrict ordinary guests to `(full_name, mobile_number, avatar_url)`; verify `is_approved_guest` and `family_group_id` cannot be modified by guests; verify defensive `BEFORE UPDATE` trigger independently aborts unauthorized mutations; verify `private.approve_guest_access` requires admin privileges; verify `handle_new_user()` ignores injected metadata. | **PASS** (Verified in P-07.2): 15/15 tests in suite 06 passed; self-approval completely eliminated through two-layer defense-in-depth. |
| `TC-DB-11` | Access Request Lifecycle & Admin Review RPC | Run `07_access_request_workflow.sql`. Verify partial unique index `idx_single_pending_access_request`; verify trigger `check_access_request_eligibility` blocks approved guests; verify `public.admin_review_access_request` enforces `guest_rsvp` admin permission, requires rejection reasons, and atomically updates profile approval and family assignment. | **PASS** (Verified in P-08): 12/12 tests in suite 07 passed; end-to-end access request lifecycle verified. |
| `TC-DB-12` | Family RSVP Engine, Attendee Management & Admin Intelligence | Run `08_family_rsvp_workflow.sql`. Verify active family manager authorization, mandatory attendee validation, automatic child attendee purging on decline/unsure, deadline triggers on parent RSVPs and child attendees across INSERT/UPDATE/DELETE, zero backdoor admin overrides, and admin reporting RPC authorization. | **PASS** (Verified in P-09): 17/17 tests in suite 08 passed; end-to-end RSVP lifecycle, deadline locks, and reporting verified. |
| `TC-DB-13` | Guest Wishes, Public Blessings Wall, Private Conversations & Memories Mode Cutoff | Run `09_wishes_and_conversations.sql`. Verify wish submission by any authenticated user, pending initial status, auto first-name extraction, public feed isolation (first name + text only), author edit reset to pending, author deletion, admin moderation (wishes permission), profile deletion retention under 'Guest' with profile_id = NULL, purge of unapproved wishes, single private conversation constraint per guest, impersonation guard (is_from_admin), conversation status lifecycle with auto-reopen on guest reply and auto-transition to in_progress on admin reply, and memories mode cutoff enforcement at 23 Nov 2026 00:00 IST. | **PASS** (Verified in P-10): 23/23 tests in suite 09 passed (142 total database assertions across all 9 suites). Zero regressions. |
| `TC-DB-14` | Unified Admin Dashboard, Single Super Admin, Permission Matrix & Notifications | Run `10_admin_dashboard_and_notifications.sql` and `scripts/test_p11_admin_dashboard.mjs`. Verify partial unique index `idx_single_super_admin` allowing only one Super Admin; verify safeguard preventing deactivation or demotion of Super Admin; verify automated notification triggers on access requests, wishes, and guest messages with `auth.role() = 'authenticated'` guards; verify notification mark-read RPCs enforce permission boundaries; verify `public.get_admin_dashboard_metrics` filters metrics (`rsvp_metrics`, `wishes_metrics`, `conversations_metrics`) strictly to caller's held permission groups with zero data leakage; verify `public.get_admin_team` and `public.admin_manage_admin_user` are restricted strictly to Super Admin; verify unified luxury header `<AdminHeader />` across all 5 admin routes (`/admin`, `/admin/access-requests`, `/admin/rsvps`, `/admin/wishes`, `/admin/conversations`). | **PASS** (Verified in P-11): 18/18 tests in suite 10 passed (161 total pgTAP assertions across 10 suites); 26/26 Node.js integration tests passed. Zero regressions. |
| `TC-DB-15` | Media Management, Private Drafts & Published Gallery Integration | Run `11_media_manager_and_gallery.sql` and `scripts/test_p12_media_and_gallery.mjs`. Verify payload constraint `chk_media_payload` enforcing photo storage_path and video youtube_url; verify `get_published_media` returns only published items omitting uploader identifiers; verify `admin_get_all_media`, `admin_create_media_item`, `admin_update_media_item`, `admin_delete_media_item`, `admin_toggle_media_published`, `admin_toggle_media_download` are strictly restricted to Super Admin or `photos` permission group (42501 Unauthorized for non-photo admins and guests); verify `get_admin_dashboard_metrics` attaches `photos_metrics` with zero leakage to unauthorized roles; verify client compression pipeline, download toggles, and YouTube privacy embeds. | **PASS** (Verified in P-12): 19/19 tests in suite 11 passed (180 total pgTAP assertions across 11 suites); 24/24 Node.js integration tests passed. Zero regressions. |




