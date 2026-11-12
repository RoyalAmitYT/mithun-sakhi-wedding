# Complete English Terminology Standardization Report

**Project:** Mithun & Sakhi Wedding Website  
**Date:** 11 November 2026  
**Status:** COMPLETE & VERIFIED  
**Scope:** Entire project — Public UI, Components, Canonical Digital Invitation (HTML, JPG, PDF), Calendar Export (.ics), Datasets, Database Seeds, and Metadata.

---

## 1. Executive Summary

A comprehensive, project-wide audit and standardization was executed to ensure consistent, elegant, and professional English terminology throughout the Mithun & Sakhi wedding application. 

All transliterated, Hinglish, and mixed-language ceremony headings and labels were replaced with their approved English equivalents. Specifically:
- **Fourth Ceremony Name:** Named exclusively **"Reception"** across all components, chapters, cards, calendar summaries, and the canonical invitation.
- **Ceremony Sequence Summary:** Standardized to **`HALDI · MEHNDI · WEDDING · RECEPTION`**.
- **Third Ceremony Name:** Standardized to **"The Sacred Wedding"** (short label: **"Wedding"**).
- **Guestbook & Wishes:** Replaced transliterated terms like `"Aashirwad"` / `"Ashirwad"` with **"Blessings"**.
- **Invitation Eyebrow:** Replaced `"Ceremonial Patra"` with **"Wedding Invitation"**.
- **Arch Headings:** Replaced `"Shubho Bibaho"` with **"Auspicious Wedding"**.
- **Schedules:** Replaced `"Muhurat"` with **"Schedule"** / **"Timings"**.
- **Protected Names Preserved:** Mithun, Sakhi, Gorain, Purulia, Chitmu, Kotshila, Ghaghra, Jaipur, Haldi, Mehndi, Vedic, and authentic family/venue names were strictly preserved.

---

## 2. Before / After Terminology Standardization Table

| Original Term / Transliteration | Standardized English Term | Context & Placement |
|---|---|---|
| `Preetibhoj` / `Reception & Preetibhoj` | **Reception** | Fourth ceremony title across all cards, chapters, and artwork |
| `Vivaha` / `The Sacred Vivaha` | **The Sacred Wedding** / **Wedding** | Third ceremony title, status indicators, and summary strips |
| `Haldi · Mehndi · Vivaha · Preetibhoj` | **Haldi · Mehndi · Wedding · Reception** | Hero ceremony summary capsule & metadata lists |
| `Gaye Holud` / `Gaye Halud` | **Haldi Ceremony** | Traditional ceremony alias / seed data |
| `Mehndi Utsav` | **Mehndi Ceremony** | Traditional ceremony alias / admin category labels / lifecycle titles |
| `Shubho Bibaho` | **Auspicious Wedding** | Ceremonial Arch monogram seal heading |
| `Ceremonial Patra` | **Wedding Invitation** | Homepage digital invitation section eyebrow |
| `ASHIRWAD · SACRED GUESTBOOK` | **BLESSINGS · SACRED GUESTBOOK** | Guestbook / Wishes header eyebrow |
| `ASHIRWAD · HEARTFELT BLESSINGS` | **BLESSINGS · HEARTFELT GUESTBOOK** | Homepage Wishes preview wall eyebrow |
| `HEARTFELT ASHIRWAD` | **HEARTFELT BLESSINGS** | Guest wish modal & preview card header |
| `Ashirwad • Guestbook` | **Blessings • Guestbook** | Guest wishes management header |
| `Auspicious Muhurat` / `Wedding Muhurat` | **Auspicious Schedule** / **Wedding Schedule** | Design preview kicker / Lifecycle CTA button text |
| `ceremonial muhurats` | **ceremonial timings** | Terms & Conditions event schedule updates |

---

## 3. Exhaustive Modified Files List

| # | File Path | Scope of Modification |
|---|---|---|
| 1 | `src/components/invitation/official-wedding-invitation.tsx` | Standardized Card 4 title to `"Reception"` and `alt="Reception Ceremony"`. |
| 2 | `src/components/hero/hero-section.tsx` | Standardized hero ceremonial capsule to `"Haldi · Mehndi · Wedding · Reception"`. |
| 3 | `src/components/hero/hero-countdown.tsx` | Replaced `"The Sacred Vivaha Is Underway"` with `"The Sacred Wedding Is Underway"`. |
| 4 | `src/components/hero/ceremonial-arch.tsx` | Replaced `"Shubho Bibaho"` with `"Auspicious Wedding"`. |
| 5 | `src/components/sections/ceremony-fullscreen-sections.tsx` | Standardized Chapter 4 kicker to `"RECEPTION"`, `titleHighlight` to `"Reception"`, and calendar title to `"Reception — Mithun & Sakhi Wedding"`. Standardized Chapter 3 calendar title. |
| 6 | `src/components/sections/celebrations-overview-section.tsx` | Standardized Ritual 4 title to `"Reception"` and image alt text. Standardized Ritual 3 alt text to remove `"Vivaha"`. |
| 7 | `src/components/sections/gallery-preview-section.tsx` | Standardized photo title to `"Reception"` and alt text to remove `"Vivaha"`. |
| 8 | `src/components/sections/countdown-section.tsx` | Standardized live day titles to `"This Evening: The Grand Reception"` and `"Tonight: The Sacred Wedding"`. |
| 9 | `src/components/sections/venues-section.tsx` | Standardized celebration name in groom celebrations list to `"Reception"`. |
| 10 | `src/components/sections/invitation-preview-section.tsx` | Replaced `"Ceremonial Patra"` with `"Wedding Invitation"`. |
| 11 | `src/components/sections/wishes-preview-wall.tsx` | Replaced `"ASHIRWAD · HEARTFELT BLESSINGS"` with `"BLESSINGS · HEARTFELT GUESTBOOK"`. |
| 12 | `src/app/wishes/wishes-view.tsx` | Replaced `"ASHIRWAD · SACRED GUESTBOOK"` with `"BLESSINGS · SACRED GUESTBOOK"`. |
| 13 | `src/components/wishes/wish-card.tsx` | Replaced `"HEARTFELT ASHIRWAD"` with `"HEARTFELT BLESSINGS"`. |
| 14 | `src/components/wishes/guest-wishes-manager.tsx` | Replaced `"Ashirwad • Guestbook"` with `"Blessings • Guestbook"`. |
| 15 | `src/components/wishes/wish-submission-modal.tsx` | Replaced `"ASHIRWAD · SACRED GUESTBOOK"` with `"BLESSINGS · SACRED GUESTBOOK"`. |
| 16 | `src/app/gallery/gallery-view.tsx` | Standardized category label to `"Reception"` and cleaned matcher categories. |
| 17 | `src/components/admin/admin-media-manager.tsx` | Standardized admin dropdown categories to `"The Sacred Wedding"`, `"Haldi Ceremony"`, `"Mehndi Ceremony"`, `"Reception"`. |
| 18 | `src/lib/lifecycle.ts` | Standardized lifecycle titles and CTAs to `"The Grand Reception"`, `"The Sacred Wedding"`, `"Mehndi Ceremony"`, `"Haldi Ceremony"`, and `"View Wedding Schedule →"`. |
| 19 | `src/data/wedding-data.ts` | Standardized `name`, `traditionalTitle`, and associated venue notes for all ceremonies to English. |
| 20 | `src/data/temporary-media.ts` | Standardized captions for ceremony previews. |
| 21 | `src/app/terms/page.tsx` | Replaced `"ceremonial muhurats"` with `"ceremonial timings"`. |
| 22 | `src/app/design-preview/page.tsx` | Replaced `"Auspicious Muhurat"` with `"Auspicious Schedule"`. |
| 23 | `supabase/seed.sql` | Standardized ceremony event names and display titles in seed data. |
| 24 | `supabase/tests/12_invitation_studio_and_utilities.sql` | Standardized mock announcement string to English. |

---

## 4. Verification & Test Results

All verification suites were executed against the live production build on `http://localhost:3000`:

1. **TypeScript Type Safety:**
   - Command: `npx tsc --noEmit`
   - Result: **0 errors** (PASS).

2. **ESLint Code Quality:**
   - Command: `npm run lint`
   - Result: **0 warnings, 0 errors** (PASS).

3. **Production Compilation:**
   - Command: `npx next build`
   - Result: **29/29 routes compiled and prerendered successfully** (PASS).

4. **Project-Wide Zero-Match Scan:**
   - Command: Case-insensitive scan across `src/` for `preetibhoj`, `vivaha`, `aashirwad`, `ashirwad`, `shubh`, `bibaho`, `patra`, `muhurat`.
   - Result: **0 matches remaining** in active application code (PASS).

5. **Canonical Invitation Export Regression:**
   - **JPG Export:** Generated fresh `mithun-sakhi-official-wedding-invitation-4x5.jpg` (834,831 bytes). Verified 4:5 aspect ratio, crisp typography, and Card 4 labeled exclusively `"Reception"`.
   - **PDF Export:** Generated fresh `mithun-sakhi-official-wedding-invitation-4x5.pdf` (835,498 bytes). Verified vector layout fidelity and 1:1 match with live DOM.

6. **Calendar Export (.ics):**
   - Downloaded `.ics` bundle. Verified summary format:
     `SUMMARY:Reception — Mithun & Sakhi Wedding`
     `SUMMARY:The Sacred Wedding — Mithun & Sakhi Wedding`
   - Zero occurrences of `Preetibhoj` or `Vivaha` in the generated calendar stream.

7. **Guestbook & Wishes:**
   - Verified `/wishes` page and `#wishes` modal: Eyebrows display `"BLESSINGS · SACRED GUESTBOOK"`.

8. **RSVP & Admin Dashboards:**
   - Verified that internal event identifiers (`haldi`, `mehndi`, `wedding`, `reception`) remain 100% intact, while user-facing display labels strictly reflect standardized English.

---

## 5. Remaining Uncertain Terms Requiring Review

**None.**  
All culturally authentic proper nouns (names of people, families, villages, and established ceremony names like Haldi and Mehndi) were preserved in accordance with the strict preservation guidelines. No ambiguous or untranslated transliterations remain in the application codebase.
