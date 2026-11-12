# Mithun & Kabita Wedding Website — Project Brief

**Document ID:** `docs/PROJECT_BRIEF.md`  
**Version:** 1.0.0  
**Status:** Authoritative Initial Specification  
**Current Phase:** P-00 — Planning and Specification Only  
**Target Release Window:** November 2026  
**Primary Timezone:** `Asia/Kolkata` (IST)  

---

## 1. Executive Summary & Product Vision

The **Mithun & Kabita Wedding Website** is a bespoke, ultra-premium, cinematic digital wedding invitation and celebration platform created for the wedding of **Mithun Gorain** and **Kabita Gorain (Manjura)**. 

Indian Hindu weddings are emotionally rich, culturally vibrant, and sacred family milestones. Traditional digital wedding websites frequently fall into two extremes: either generic, formulaic templates cluttered with garish floral stock vectors and artificial animations, or rigid utility-first event cards that lack warmth and majesty.

Our vision is to build an **art-directed, haute-couture digital wedding experience** that balances:
1. **Sacred Emotional Resonance:** Thoughtful traditional Indian wedding references, royal ornamental accents, and deep respect for family rituals (Haldi, Mehndi, Wedding, and Reception/Preetibhoj).
2. **Contemporary Luxury Editorial Refinement:** Luminous champagne typography, deliberate spatial breathing room, sophisticated proportions, high-fashion editorial layout rhythms, and smooth, subtle motion.
3. **Robust Engineering & Privacy:** Highly secure, role-based guest authorization, strict ceremony-specific RSVP cutoff enforcement, private one-to-one guest-to-admin communication, granular administrative controls, and an authoritative post-wedding lifecycle transition (*Memories Mode*).

This platform is custom-crafted for Mithun and Kabita. It is designed to stand as an enduring digital heirloom for the couple, their families, and their guests.

---

## 2. Target Audiences & Personas

The application serves five distinct user personas across three access tiers:

| Persona | Access Tier | Primary Objectives & Needs | Key Touchpoints |
| :--- | :--- | :--- | :--- |
| **Public Guest / Extended Circle** | Public (Unauthenticated) | View ceremony dates, venues, Google Maps directions, public invitation preview, submit public wishes (after sign-up), view published wedding memories, access telephone and WhatsApp contacts. | Home, Events, Gallery, Invitation, Wishes Preview, Contact. |
| **Invited Guest (General)** | Authenticated (Registered) | Submit an Access Request specifying family relationship; submit a congratulatory wish; participate in a private question/request thread with the hosts; manage profile or delete account. | Guest Dashboard, Wishes, Conversations, Profile. |
| **Family RSVP Manager** | Authenticated (Approved Manager) | Respond to ceremony-specific RSVPs for their entire family group before strict deadlines; specify exact attendee names; record arrival details and dietary/special notes. | Guest Dashboard, Family RSVP Engine. |
| **Wedding Coordinator / Admin** | Authenticated (Granular Admin) | Review guest access requests; assign families and managers; moderate public wishes; respond to private guest questions; upload and publish photos/videos; view ceremony headcounts. | Admin Console (scoped to granted permission groups). |
| **Super Admin (Couple / Host)** | Authenticated (Super Admin) | Complete authority: create/deactivate admins, assign permission groups, manage wedding content and event data, transfer family RSVP managers, oversee site lifecycle. | Full Admin Console, Security & Settings. |

---

## 3. Core Product Objectives

1. **Cinematic First Impression:** Deliver an unforgettable hero and narrative flow that honors the couple and parents without fabricating unsupported relationship stories.
2. **Ceremony Guidance:** Provide clear, reliable venue details, Google Maps navigation links, and ceremony schedules in Purulia, West Bengal across all four events.
3. **Ceremony-Specific RSVP Governance:** Enable precise guest attendance planning with strict per-ceremony deadlines (11:59 PM IST on the preceding calendar day) and mandatory attendee naming.
4. **Interactive Digital Invitation Studio:** Offer two distinct invitation designs (Cinematic Portrait & Traditional Royal Indian) with high-res image and print-ready PDF export and verified QR code integration.
5. **Private, Respectful Communication:** Give guests a dedicated, confidential conversation channel with wedding hosts instead of exposing inquiries publicly.
6. **Community Celebration with Moderation:** Allow guests to publish heartfelt wishes while preventing inappropriate submissions through mandatory administrative moderation.
7. **Media Showcase:** Provide a curated, high-performance photo and video gallery with private draft workflows, download controls, and YouTube video integration.
8. **Authoritative Post-Wedding Lifecycle:** Transition automatically into *Memories Mode* on 23 November 2026 at 12:00 AM IST, locking new registrations and submissions while preserving memories permanently.

---

## 4. Scope Boundaries & Non-Goals

To maintain focus, exceptional quality, and absolute security on free-tier infrastructure, explicit product boundaries are defined:

### Explicitly In Scope
* Fully responsive web application optimized for desktop, tablet, and mobile.
* Single-page cinematic narrative on Home, complemented by dedicated sub-pages (`/events`, `/gallery`, `/invitation`, `/privacy`, `/terms`).
* Dual-theme Digital Invitation Studio (Online, PNG, PDF, verified QR code).
* Persistent, non-autoplaying background music player across route transitions.
* Cookie-based Supabase SSR authentication (Email/Password and Google OAuth).
* Administrative access-request approval and family-group assignment system.
* Ceremony-specific RSVP engine with mandatory attendee naming and hard database-enforced deadlines.
* Moderated public wishes wall with guest edit/deletion capabilities.
* Private 1-to-1 guest-to-admin message threads with status tracking (`New`, `In Progress`, `Resolved`).
* Admin Console with exactly one Super Admin and six granular permission groups.
* Photo management (Upload → Private Draft → Preview → Publish) and YouTube video integration.
* Automated *Memories Mode* server-side lifecycle transition.

### Explicitly Out of Scope (Non-Goals)
* **No Automated WhatsApp / SMS Distribution:** The website provides click-to-chat WhatsApp and `tel:` links; it will **not** implement automated WhatsApp Business API bots, automated bulk messaging, or SMS gateways.
* **No Invitation Codes:** Access is managed through registered profile access requests and administrative approvals. Invitation codes are omitted.
* **No Complex Multi-tier Headcount Limits:** There is no artificial attendance cap or seat allocation algorithm.
* **No Spreadsheets/Excel/CSV Exports:** Administrative reporting is displayed directly in polished, responsive on-screen dashboards.
* **No Public Video File Hosting:** Videos are embedded via YouTube URLs (public or unlisted). Raw MP4 video uploads are excluded.
* **No Multi-Language Translation:** The website is English-only.
* **No E-Commerce, Registry, or Payment Gateways:** No gift registries, monetary gifting tools, or commercial checkout flows.
* **No 3D / WebGL / Canvas Scroll-Jacking:** Visual grandeur is achieved through typography, photography, ornamental SVGs, and performant CSS/Motion transitions, avoiding heavy, battery-draining WebGL runtimes.

---

## 5. Architectural & Technical Constraints

### Technology Stack
* **Framework:** Next.js (App Router, React, TypeScript).
* **Styling:** Tailwind CSS with custom design tokens.
* **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS), Supabase Auth (cookie-based sessions via `@supabase/ssr`), Supabase Storage.
* **Animation:** Motion for React (`motion/react`) used purposefully for entrance reveals, dialogs, and smooth state transitions.
* **Deployment:** Vercel Hobby tier.

### Infrastructure & Free-Tier Operational Constraints
1. **Zero Paid API Dependencies:** The entire application operates without requiring paid third-party subscriptions, using Vercel Hobby and Supabase Free tiers.
2. **Supabase Free Tier Inactivity Pausing:** Supabase Free projects may be paused by the platform after a period of insufficient database activity (typically 7 days).
   * *Realistic Operational Posture:* Sending an automated health-check request or periodic HTTP ping is **not** a guaranteed method to prevent automatic platform pausing. No automated health-check or cron ping has been implemented or scheduled. Continuous service availability cannot be guaranteed on free-tier hosting.
   * *Manual Backup Strategy (CLI):* Supabase Free does not include automated downloadable backups or Point-in-Time Recovery (PITR) available on paid plans. Instead, the project plans for documented, manually executable Supabase CLI database dumps (`supabase db dump`) with secure off-site storage of the resulting SQL backups.
   * *Separate Storage Object Backups:* Database exports contain relational schema and row data only; they do **not** preserve binary media files uploaded to Supabase Storage. Storage objects must be backed up separately via manual bucket synchronization or export procedures.
   * *Operational Acceptance:* The couple and administrators acknowledge that free-tier projects may pause if inactive, and manual unpausing via the Supabase dashboard alongside manual backup routines represents the agreed operational model.
3. **Vercel Hobby Execution Limits:** Serverless function execution times are capped at 10 seconds (standard). Large media processing must occur client-side before upload or rely on direct Supabase storage uploads.
4. **Password Recovery Without Paid SMTP:** Default Supabase email limits are constrained (30 emails/hour). An external free SMTP provider (e.g., Resend free tier or Brevo) will be configured if available; otherwise, an administrator-assisted manual password reset workflow will serve as an authoritative fallback.
5. **21st.dev MCP Constraints:** The 21st.dev MCP connection operates under free limits (0 AI generation credits, 2 daily component code retrievals). In P-00 and future phases, no AI generation tools or unauthorized code retrievals may be called.

---

## 6. Outstanding External Dependencies

The following assets and external accounts are required before final production deployment:

1. **Authentic Couple Photography:** High-resolution professional portraits of Mithun and Kabita. (Graceful architectural/ornamental placeholders are used in the interim).
2. **Wedding Music Tracks:** Confirmed royalty-free or licensed MP3 audio tracks for the persistent player.
3. **Confirmed YouTube Video Links:** Public or Unlisted URLs for wedding highlight films.
4. **Final Verified Vercel Domain:** Confirmation of `mithun-kabita-wedding.vercel.app` or custom domain before generating the final production QR code.
5. **Production Supabase Credentials:** Production project URL, anon key, and service role key (secure server environment only).
6. **Google OAuth Client Credentials:** Production Google Cloud Console Client ID and Client Secret for social sign-in.
7. **Production SMTP Credentials:** Optional free SMTP credentials for reliable password recovery emails.

---

## 7. High-Level Success Criteria

* **Visual Elegance:** The public site achieves an editorial, luxury aesthetic centered on Luminous Champagne White (`#FFFCF6`) and refined Antique Gold (`#B8975E`), with zero appearance of a generic template.
* **Mobile Responsiveness:** 100% of public, guest, and admin workflows operate flawlessly on mobile touchscreens (down to 320px width).
* **Strict Security:** Zero data leaks between guest accounts, family groups, private conversation threads, or unmoderated content. Zero service-role secrets exposed to the client.
* **RSVP Integrity:** RSVPs for each ceremony lock precisely at 11:59 PM IST on the preceding calendar day, enforced at both the API and database levels with zero late-edit bypasses.
* **Reliable Lifecycle:** The site shifts flawlessly into *Memories Mode* on 23 November 2026 at 12:00 AM IST.
